import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import {
  SUPPORT_CONTACT_METHODS, SUPPORT_RELATED_TO, SUPPORT_SUBJECTS, SERVICE_CODES,
  type SupportInboxRow, type SupportTicketView, type MessagesInboxItem,
} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {caseScope, type CaseActor} from '../cases/case-access';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

const body = z.string().trim().min(1, 'Enter a message').max(2000);
const TicketInput = z.strictObject({
  subject: z.enum(SUPPORT_SUBJECTS.map(s => s.code) as [string, ...string[]]),
  related_to: z.enum(SUPPORT_RELATED_TO.map(s => s.code) as [string, ...string[]]),
  description: z.string().trim().min(10, 'Describe the issue in at least 10 characters').max(4000),
  contact_method: z.enum(SUPPORT_CONTACT_METHODS.map(s => s.code) as [string, ...string[]]),
  case_id: z.uuid().nullable().optional(),
});
const CallbackInput = z.strictObject({
  name: z.string().trim().min(1, 'Enter your name').max(120),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid mobile number'),
  note: z.string().trim().max(500).optional(),
  // Raised from a service screen (e.g. FIR Draft's Request Callback): shown in the admin inbox.
  service_code: z.enum(SERVICE_CODES).optional(),
});
const ChatInput = z.strictObject({body, service_code: z.enum(SERVICE_CODES).optional()});
const InboxQuery = z.strictObject({q: z.string().trim().max(200).optional()});
const AdminQuery = z.strictObject({status: z.enum(['open', 'closed']).default('open'), kind: z.enum(['ticket', 'callback', 'chat']).optional()});

type Ticket = Prisma.SupportTicketGetPayload<{include: {messages: true}}>;

/** Support is the requester's own data plus admin. Advocates may raise tickets
 *  about their own account; nobody else's ticket is ever readable. */
@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}

  private async notifyAdmins(tx: Prisma.TransactionClient, ticketId: string, title: string, bodyText: string) {
    for (const admin of await tx.user.findMany({where: {role: 'admin', status: 'active'}, select: {id: true}}))
      await this.notifications.send(tx, {user_id: admin.id, kind: 'support_waiting', title, body: bodyText});
    void ticketId;
  }

  private view(t: Ticket, viewer: CaseActor): SupportTicketView {
    return {
      id: t.id, kind: t.kind as SupportTicketView['kind'], status: t.status as SupportTicketView['status'],
      subject: t.subject, related_to: t.related_to, contact_method: t.contact_method,
      contact_name: t.contact_name, contact_phone: t.contact_phone, case_id: t.case_id, service_code: t.service_code,
      created_at: t.created_at.toISOString(), closed_at: t.closed_at?.toISOString() ?? null,
      messages: t.messages.slice().sort((a, b) => a.created_at.getTime() - b.created_at.getTime() || a.id.localeCompare(b.id))
        .map(m => ({id: m.id, body: m.body, from: m.sender_role === 'admin' ? 'support' : 'requester', mine: m.sender_id === viewer.id,
          created_at: m.created_at.toISOString(), read_at: m.read_at?.toISOString() ?? null})),
    };
  }

  private async own(tx: Prisma.TransactionClient, actor: CaseActor, id: string) {
    if (actor.role === 'admin') throw new ForbiddenException('Use the admin support inbox');
    const ticket = await tx.supportTicket.findFirst({where: {id, user_id: actor.id}, include: {messages: true}});
    if (!ticket) throw new NotFoundException('Support request not found');
    return ticket;
  }

  async createTicket(actor: CaseActor, input: unknown) {
    if (actor.role === 'admin') throw new ForbiddenException('Admins cannot raise support requests');
    const v = parse(TicketInput, input);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      // A linked case must be one the requester can already see.
      if (v.case_id && !await tx.case.findFirst({where: {AND: [caseScope(actor), {id: v.case_id}]}, select: {id: true}}))
        throw new NotFoundException('Case not found');
      const subject = SUPPORT_SUBJECTS.find(s => s.code === v.subject)!.label;
      const ticket = await tx.supportTicket.create({data: {user_id: actor.id, kind: 'ticket', subject, related_to: v.related_to,
        description: v.description, contact_method: v.contact_method, case_id: v.case_id ?? null}});
      await tx.supportMessage.create({data: {ticket_id: ticket.id, sender_id: actor.id, sender_role: actor.role, body: v.description}});
      await this.notifyAdmins(tx, ticket.id, 'New support request', subject);
      return this.view(await tx.supportTicket.findUniqueOrThrow({where: {id: ticket.id}, include: {messages: true}}), actor);
    });
  }

  async requestCallback(actor: CaseActor, input: unknown) {
    if (actor.role === 'admin') throw new ForbiddenException('Admins cannot request callbacks');
    const v = parse(CallbackInput, input);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const pending = await tx.supportTicket.findFirst({where: {user_id: actor.id, kind: 'callback', status: 'open'}, include: {messages: true}});
      if (pending) {
        if (v.service_code && pending.service_code !== v.service_code)
          await tx.supportTicket.update({where: {id: pending.id}, data: {service_code: v.service_code, updated_at: new Date()}});
        return this.view(await tx.supportTicket.findUniqueOrThrow({where: {id: pending.id}, include: {messages: true}}), actor);
      }
      const ticket = await tx.supportTicket.create({data: {user_id: actor.id, kind: 'callback', subject: 'Callback request', service_code: v.service_code ?? null,
        contact_method: 'phone', contact_name: v.name, contact_phone: v.phone, description: v.note ?? null}});
      await tx.supportMessage.create({data: {ticket_id: ticket.id, sender_id: actor.id, sender_role: actor.role,
        body: `Please call me back on ${v.phone}.${v.note ? ` ${v.note}` : ''}`}});
      await this.notifyAdmins(tx, ticket.id, 'Callback requested', v.name);
      return this.view(await tx.supportTicket.findUniqueOrThrow({where: {id: ticket.id}, include: {messages: true}}), actor);
    });
  }

  /** One open chat per person; a closed chat starts a fresh one. */
  async chat(actor: CaseActor, input: unknown) {
    if (actor.role === 'admin') throw new ForbiddenException('Admins reply from the support inbox');
    const v = parse(ChatInput, input);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'support-chat:' + actor.id}))::text`;
      let ticket = await tx.supportTicket.findFirst({where: {user_id: actor.id, kind: 'chat', status: 'open'}});
      const fresh = !ticket;
      if (!ticket) ticket = await tx.supportTicket.create({data: {user_id: actor.id, kind: 'chat', subject: 'Support chat', contact_method: 'chat', service_code: v.service_code ?? null}});
      else if (v.service_code && ticket.service_code !== v.service_code) ticket = await tx.supportTicket.update({where: {id: ticket.id}, data: {service_code: v.service_code}});
      await tx.supportMessage.create({data: {ticket_id: ticket.id, sender_id: actor.id, sender_role: actor.role, body: v.body}});
      await tx.supportTicket.update({where: {id: ticket.id}, data: {updated_at: new Date()}});
      if (fresh) await this.notifyAdmins(tx, ticket.id, 'New support chat', v.body.slice(0, 80));
      return this.view(await tx.supportTicket.findUniqueOrThrow({where: {id: ticket.id}, include: {messages: true}}), actor);
    });
  }

  async currentChat(actor: CaseActor) {
    const db = await this.prisma.getClient();
    const ticket = await db.supportTicket.findFirst({where: {user_id: actor.id, kind: 'chat', status: 'open'}, include: {messages: true}});
    return ticket ? this.view(ticket, actor) : null;
  }

  async mine(actor: CaseActor) {
    if (actor.role === 'admin') throw new ForbiddenException('Use the admin support inbox');
    const db = await this.prisma.getClient();
    const rows = await db.supportTicket.findMany({where: {user_id: actor.id}, include: {messages: true}, orderBy: [{created_at: 'desc'}, {id: 'asc'}], take: 50});
    return rows.map(t => this.view(t, actor));
  }

  async one(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => this.view(await this.own(tx, actor, id), actor));
  }

  async reply(actor: CaseActor, id: string, input: unknown) {
    const v = parse(ChatInput, input);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const ticket = await this.own(tx, actor, id);
      if (ticket.status !== 'open') throw new ConflictException('This request is closed. Start a new support chat or request.');
      await tx.supportMessage.create({data: {ticket_id: id, sender_id: actor.id, sender_role: actor.role, body: v.body}});
      await tx.supportTicket.update({where: {id}, data: {updated_at: new Date()}});
      return this.view(await tx.supportTicket.findUniqueOrThrow({where: {id}, include: {messages: true}}), actor);
    });
  }

  async markRead(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      await this.own(tx, actor, id);
      await tx.supportMessage.updateMany({where: {ticket_id: id, sender_role: 'admin', read_at: null}, data: {read_at: new Date()}});
      return {read: true};
    });
  }

  // ---------------- admin ----------------
  private requireAdmin(actor: CaseActor) { if (actor.role !== 'admin') throw new ForbiddenException('Admin access required'); }

  async adminList(actor: CaseActor, query: unknown): Promise<{items: SupportInboxRow[]; counts: {open: number; closed: number}}> {
    this.requireAdmin(actor);
    const q = parse(AdminQuery, query);
    const db = await this.prisma.getClient();
    const rows = await db.supportTicket.findMany({where: {status: q.status, ...(q.kind ? {kind: q.kind} : {})}, include: {messages: true},
      orderBy: [{created_at: 'asc'}, {id: 'asc'}], take: 200});
    const users = await db.user.findMany({where: {id: {in: [...new Set(rows.map(r => r.user_id))]}}, select: {id: true, full_name: true, role: true, email: true}});
    const [open, closed] = await Promise.all([db.supportTicket.count({where: {status: 'open'}}), db.supportTicket.count({where: {status: 'closed'}})]);
    const items = rows.map(t => {
      const msgs = t.messages.slice().sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      const lastAdmin = msgs.filter(m => m.sender_role === 'admin').at(-1);
      const waiting = msgs.find(m => m.sender_role !== 'admin' && (!lastAdmin || m.created_at > lastAdmin.created_at));
      const u = users.find(x => x.id === t.user_id);
      return {id: t.id, kind: t.kind as SupportInboxRow['kind'], status: t.status as SupportInboxRow['status'], subject: t.subject, service_code: t.service_code,
        requester: {id: t.user_id, name: u?.full_name ?? 'Unknown user', role: u?.role ?? 'client'},
        last_message: msgs.at(-1)?.body ?? null, created_at: t.created_at.toISOString(),
        waiting_since: t.status === 'open' && waiting ? waiting.created_at.toISOString() : null,
        unread: msgs.filter(m => m.sender_role !== 'admin' && !m.read_at).length};
    });
    // Oldest unanswered first; answered tickets follow, oldest first.
    items.sort((a, b) => (a.waiting_since ? 0 : 1) - (b.waiting_since ? 0 : 1) ||
      Date.parse(a.waiting_since ?? a.created_at) - Date.parse(b.waiting_since ?? b.created_at));
    return {items, counts: {open, closed}};
  }

  async adminOne(actor: CaseActor, id: string) {
    this.requireAdmin(actor);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const ticket = await tx.supportTicket.findUnique({where: {id}, include: {messages: true}});
      if (!ticket) throw new NotFoundException('Support request not found');
      await tx.supportMessage.updateMany({where: {ticket_id: id, sender_role: {not: 'admin'}, read_at: null}, data: {read_at: new Date()}});
      const user = await tx.user.findUnique({where: {id: ticket.user_id}, select: {full_name: true, email: true, phone: true, role: true}});
      const linked = ticket.case_id ? await tx.case.findUnique({where: {id: ticket.case_id}, select: {reference: true, service_code: true}}) : null;
      return {...this.view(ticket, actor), description: ticket.description,
        requester: {id: ticket.user_id, name: user?.full_name ?? 'Unknown user', email: user?.email ?? null, phone: user?.phone ?? null, role: user?.role ?? 'client'},
        case: linked && ticket.case_id ? {id: ticket.case_id, ...linked} : null};
    });
  }

  async adminReply(actor: CaseActor, id: string, input: unknown) {
    this.requireAdmin(actor);
    const v = parse(ChatInput, input);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const ticket = await tx.supportTicket.findUnique({where: {id}});
      if (!ticket) throw new NotFoundException('Support request not found');
      if (ticket.status !== 'open') throw new ConflictException('This request is closed.');
      await tx.supportMessage.create({data: {ticket_id: id, sender_id: actor.id, sender_role: 'admin', body: v.body}});
      await tx.supportTicket.update({where: {id}, data: {updated_at: new Date()}});
      await this.notifications.send(tx, {user_id: ticket.user_id, kind: 'support_reply', title: 'Legalitt Support replied', body: ticket.subject ?? 'Support'});
      return {replied: true};
    });
  }

  async adminClose(actor: CaseActor, id: string) {
    this.requireAdmin(actor);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const ticket = await tx.supportTicket.findUnique({where: {id}});
      if (!ticket) throw new NotFoundException('Support request not found');
      if (ticket.status === 'closed') return {closed: true};
      await tx.supportTicket.update({where: {id}, data: {status: 'closed', closed_at: new Date(), closed_by: actor.id, updated_at: new Date()}});
      await tx.adminAction.create({data: {admin_id: actor.id, action: 'close_support_request', subject_type: 'support_ticket', subject_id: id, payload: {}}});
      return {closed: true};
    });
  }

  // ---------------- unified messages inbox (D-28) ----------------
  async inbox(actor: CaseActor, query: unknown): Promise<{items: MessagesInboxItem[]}> {
    if (actor.role === 'admin') throw new ForbiddenException('Use the admin support inbox');
    const {q} = parse(InboxQuery, query);
    const needle = q?.toLowerCase() ?? '';
    const db = await this.prisma.getClient();
    // Only cases the actor belongs to; an advocate thread exists once an advocate is assigned.
    const cases = await db.case.findMany({where: {AND: [caseScope(actor), {advocate_id: {not: null}}]},
      select: {id: true, reference: true, service_code: true, matter_type: true, title: true, status: true,
        client_id_relation: {select: {full_name: true}},
        advocate_id_relation: {select: {full_name: true, advocate_profiles_user_id_relations: {select: {verification: true}}}},
        message_threads_case_id_relations: {where: {kind: 'client_advocate'}, select: {id: true}}}, take: 200});
    const threadIds = cases.flatMap(c => c.message_threads_case_id_relations.map(t => t.id));
    const messages = threadIds.length ? await db.message.findMany({where: {thread_id: {in: threadIds}}, orderBy: [{created_at: 'asc'}, {id: 'asc'}],
      select: {id: true, thread_id: true, sender_id: true, body: true, document_id: true, created_at: true, read_at: true,
        document_id_relation: {select: {filename: true}}}}) : [];
    const items: MessagesInboxItem[] = [];
    for (const c of cases) {
      const threadId = c.message_threads_case_id_relations[0]?.id ?? null;
      const msgs = threadId ? messages.filter(m => m.thread_id === threadId) : [];
      const last = msgs.at(-1);
      const counterpart = actor.role === 'client' ? c.advocate_id_relation?.full_name ?? 'Your advocate' : c.client_id_relation.full_name;
      const matter = c.title?.trim() || null;
      const hay = [counterpart, c.reference, matter, c.matter_type, ...msgs.map(m => m.body ?? m.document_id_relation?.filename ?? '')].join(' ').toLowerCase();
      if (needle && !hay.includes(needle)) continue;
      items.push({kind: 'case', key: `case:${c.id}`, case_id: c.id, thread_id: threadId, ticket_id: null, title: counterpart,
        verified: actor.role === 'client' && c.advocate_id_relation?.advocate_profiles_user_id_relations?.verification === 'approved',
        reference: c.reference, service_code: c.service_code as MessagesInboxItem['service_code'], matter_type: c.matter_type, matter,
        status: c.status,
        last_message: last ? {body: last.body ?? null, attachment: last.document_id_relation?.filename ?? null, mine: last.sender_id === actor.id, created_at: last.created_at.toISOString()} : null,
        unread: msgs.filter(m => m.sender_id !== actor.id && !m.read_at).length});
    }
    const tickets = await db.supportTicket.findMany({where: {user_id: actor.id}, include: {messages: true}, orderBy: {created_at: 'desc'}, take: 50});
    for (const t of tickets) {
      const msgs = t.messages.slice().sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      const last = msgs.at(-1);
      const hay = ['legalitt support', t.subject, ...msgs.map(m => m.body)].join(' ').toLowerCase();
      if (needle && !hay.includes(needle)) continue;
      items.push({kind: 'support', key: `support:${t.id}`, case_id: null, thread_id: null, ticket_id: t.id, title: 'Legalitt Support',
        verified: false, reference: null, service_code: null, matter_type: null, matter: t.subject, status: t.status,
        last_message: last ? {body: last.body, attachment: null, mine: last.sender_id === actor.id, created_at: last.created_at.toISOString()} : null,
        unread: msgs.filter(m => m.sender_role === 'admin' && !m.read_at).length});
    }
    items.sort((a, b) => Date.parse(b.last_message?.created_at ?? '1970-01-01') - Date.parse(a.last_message?.created_at ?? '1970-01-01') || a.key.localeCompare(b.key));
    return {items};
  }
}
