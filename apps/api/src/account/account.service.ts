import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import {PDFDocument, rgb, type PDFPage} from 'pdf-lib';
import {SERVICE_NAMES, formatPaise, type QuoteBreakdown, type ServiceCode} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {CaseRepository} from '../cases/case-repository';
import {PdfText, embedTextFonts} from '../documents/pdf-text';

// Client account area (D-15, D-17, D-18, D-19). Every query is scoped to the
// signed-in client; another user's ids return 404 exactly like a missing row.

const ProfileUpdate = z.strictObject({
  name: z.string().trim().min(1).max(200).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v + 'T00:00:00Z')) && v <= new Date().toISOString().slice(0, 10), 'Enter a valid past date').nullable().optional(),
  gender: z.enum(['female', 'male', 'other', 'prefer_not_to_say']).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  state: z.string().trim().max(80).nullable().optional(),
  country: z.string().trim().max(80).nullable().optional(),
});
const ACTIVE = ['paid', 'assigning', 'assigned', 'advocate_accepted', 'advocate_declined', 'in_progress', 'client_review', 'changes_requested', 'approved', 'dispatching', 'dispatched'];
const blank = (v?: string | null) => v?.trim() ? v.trim() : null;
const breakdownOf = (snapshot: unknown) => (snapshot as {breakdown?: QuoteBreakdown} | null)?.breakdown ?? null;

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService, private readonly cases: CaseRepository) {}

  private client(actor: CaseActor) {
    if (actor.role !== 'client') throw new ForbiddenException('Client account required');
  }

  async profile(actor: CaseActor) {
    this.client(actor);
    const db = await this.prisma.getClient();
    const user = await db.user.findUniqueOrThrow({where: {id: actor.id}, include: {client_profile: true}});
    const grouped = await db.case.groupBy({by: ['status'], where: {client_id: actor.id}, _count: {_all: true}});
    const count = (statuses: string[]) => grouped.filter(g => statuses.includes(g.status)).reduce((n, g) => n + g._count._all, 0);
    const p = user.client_profile;
    return {
      id: user.id, name: user.full_name, email: user.email, phone: user.phone,
      email_verified: user.email_verified, phone_verified: user.phone_verified,
      date_of_birth: p?.date_of_birth ? p.date_of_birth.toISOString().slice(0, 10) : null,
      gender: p?.gender ?? null, city: p?.city ?? null, state: p?.state ?? null, country: p?.country ?? null,
      counts: {active_cases: count(ACTIVE), total_cases: grouped.reduce((n, g) => n + g._count._all, 0)},
    };
  }

  async updateProfile(actor: CaseActor, body: unknown) {
    this.client(actor);
    const input = parse(ProfileUpdate, body);
    const db = await this.prisma.getClient();
    await db.$transaction(async tx => {
      if (input.name) await tx.user.update({where: {id: actor.id}, data: {full_name: input.name, updated_at: new Date()}});
      const data = {
        ...(input.date_of_birth !== undefined ? {date_of_birth: input.date_of_birth ? new Date(input.date_of_birth + 'T00:00:00Z') : null} : {}),
        ...(input.gender !== undefined ? {gender: input.gender} : {}),
        ...(input.city !== undefined ? {city: blank(input.city)} : {}),
        ...(input.state !== undefined ? {state: blank(input.state)} : {}),
        ...(input.country !== undefined ? {country: blank(input.country)} : {}),
        updated_at: new Date(),
      };
      await tx.clientProfile.upsert({where: {user_id: actor.id}, create: {user_id: actor.id, ...data}, update: data});
    });
    return this.profile(actor);
  }

  /** Every document the client may see across their cases. Visibility is the
   *  per-service case-read rule (unreleased advocate, FIR and report files stay hidden). */
  async documents(actor: CaseActor, caseId?: string) {
    this.client(actor);
    const db = await this.prisma.getClient();
    const rows = await db.case.findMany({where: {client_id: actor.id, ...(caseId ? {id: caseId} : {})}, orderBy: {created_at: 'desc'},
      select: {id: true, reference: true, service_code: true, status: true}});
    if (caseId && !rows.length) throw new NotFoundException('Case not found');
    const out: unknown[] = [];
    for (const row of rows) {
      const view = await this.cases.read(actor, row.id) as {documents?: {id: string; owner_id: string; kind: string; filename: string; mime_type: string; size_bytes: bigint | string; page_count: number | null; created_at: Date; status: string}[]};
      const docs = (view.documents ?? []).filter(d => d.status === 'uploaded');
      const owners = new Map((await db.user.findMany({where: {id: {in: [...new Set(docs.map(d => d.owner_id))]}}, select: {id: true, role: true}})).map(u => [u.id, u.role]));
      for (const d of docs) {
        const mine = d.owner_id === actor.id;
        const editable = mine && ['draft', 'payment_pending'].includes(row.status);
        out.push({
          id: d.id, filename: d.filename, kind: d.kind, mime_type: d.mime_type, size_bytes: d.size_bytes.toString(),
          page_count: d.page_count, created_at: d.created_at,
          origin: mine ? 'client' : owners.get(d.owner_id) === 'advocate' ? 'advocate' : 'legalitt',
          case: {id: row.id, reference: row.reference, service_code: row.service_code, service_name: SERVICE_NAMES[row.service_code as ServiceCode] ?? row.service_code, status: row.status},
          deletable: editable,
          delete_blocked_reason: editable ? null : mine
            ? 'This file is part of a submitted request, so it can’t be removed here. Contact Legalitt Support if it needs to be withdrawn.'
            : 'This file was shared with you on your case. Only the person who added it can remove it.',
        });
      }
    }
    return {items: out};
  }

  private async paymentRows(actor: CaseActor, id?: string) {
    this.client(actor);
    const db = await this.prisma.getClient();
    return db.payment.findMany({where: {payer_id: actor.id, case_id_relation: {client_id: actor.id}, ...(id ? {id} : {})},
      orderBy: [{created_at: 'desc'}, {id: 'asc'}],
      include: {quote: {select: {snapshot: true}}, case_id_relation: {select: {id: true, reference: true, service_code: true, status: true, tier: true}}}});
  }
  private paymentView(p: Awaited<ReturnType<AccountService['paymentRows']>>[number]) {
    const c = p.case_id_relation;
    return {
      id: p.id, purpose: p.purpose, status: p.status, simulated: p.simulated, reference: p.rzp_payment_id,
      base_amount_paise: p.base_amount_paise.toString(), gst_paise: p.gst_paise.toString(), total_paise: p.total_paise.toString(),
      created_at: p.created_at, captured_at: p.captured_at,
      case: {id: c.id, reference: c.reference, service_code: c.service_code, service_name: SERVICE_NAMES[c.service_code as ServiceCode] ?? c.service_code, status: c.status, tier: c.tier},
      breakdown: breakdownOf(p.quote?.snapshot),
    };
  }
  async payments(actor: CaseActor) {
    const items = (await this.paymentRows(actor)).map(p => this.paymentView(p));
    const captured = items.filter(p => p.status === 'captured');
    return {items, totals: {captured_paise: captured.reduce((n, p) => n + BigInt(p.total_paise), 0n).toString(), captured_count: captured.length}};
  }
  async payment(actor: CaseActor, id: string) {
    const [row] = await this.paymentRows(actor, id);
    if (!row) throw new NotFoundException('Payment not found');
    return this.paymentView(row);
  }

  /** D-19: a payment receipt, explicitly not a GST tax invoice. */
  async receipt(actor: CaseActor, id: string) {
    const [row] = await this.paymentRows(actor, id);
    if (!row || row.status !== 'captured') throw new NotFoundException('Receipt not available');
    const db = await this.prisma.getClient();
    const payer = await db.user.findUniqueOrThrow({where: {id: actor.id}, select: {full_name: true, email: true}});
    const v = this.paymentView(row), b = v.breakdown;
    const at = row.captured_at ?? row.created_at;
    const pdf = await PDFDocument.create();
    pdf.setTitle(`Legalitt payment receipt ${row.id.slice(0, 8).toUpperCase()}`); pdf.setCreationDate(at); pdf.setModificationDate(at);
    const text = new PdfText(pdf, await embedTextFonts(pdf));
    const page: PDFPage = pdf.addPage([595, 842]);
    const ink = rgb(.12, .12, .12), muted = rgb(.4, .4, .4), left = 50, right = 545;
    let top = 50;
    const line = (label: string, value: string, bold = false) => {
      text.draw(page, text.runs(label, bold ? 'bold' : 'regular'), left, top, 11, ink);
      const runs = text.runs(value, bold ? 'bold' : 'regular');
      text.draw(page, runs, right - text.width(runs, 11), top, 11, ink); top += 20;
    };
    const para = (v: string, size = 10, color = muted) => { for (const r of text.wrap([{text: v}], right - left, size)) { text.draw(page, r, left, top, size, color); top += size + 6; } };
    text.draw(page, text.runs('LEGALITT', 'bold'), left, top, 16, ink); top += 26;
    text.draw(page, text.runs('Payment receipt', 'bold'), left, top, 14, ink); top += 20;
    para('This is a payment receipt, not a tax invoice. GST tax invoices will be available once Legalitt’s GST details are added.');
    if (row.simulated) { top += 4; para('Demo payment (simulated) — no money moved.', 11, rgb(.6, .2, .1)); }
    top += 10; page.drawLine({start: {x: left, y: 842 - top}, end: {x: right, y: 842 - top}, thickness: .6, color: muted}); top += 14;
    line('Receipt number', row.id.slice(0, 8).toUpperCase());
    line('Date', at.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'}) + ' IST');
    line('Paid by', payer.full_name);
    if (payer.email) line('Email', payer.email);
    line('Service', v.case.service_name);
    line('Request', v.case.reference);
    if (row.rzp_payment_id) line('Payment reference', row.rzp_payment_id);
    top += 8; page.drawLine({start: {x: left, y: 842 - top}, end: {x: right, y: 842 - top}, thickness: .6, color: muted}); top += 14;
    if (b) {
      line('Service fee', formatPaise(b.service_fee_paise));
      if (BigInt(b.platform_fee_paise)) line('Platform fee', formatPaise(b.platform_fee_paise));
      if (BigInt(b.delivery_fee_paise)) line('Delivery fee', formatPaise(b.delivery_fee_paise));
      line('GST (18%)', formatPaise(b.gst_paise));
      if (BigInt(b.page_overage_paise)) line(`Additional pages (${b.charged_pages}, no GST)`, formatPaise(b.page_overage_paise));
    } else {
      line('Amount', formatPaise(v.base_amount_paise));
      if (BigInt(v.gst_paise)) line('GST', formatPaise(v.gst_paise));
    }
    top += 4; line('Total paid', formatPaise(v.total_paise), true);
    top += 20; para('Questions about this payment? Contact Legalitt Support from the Help & Support section of the app.');
    return {filename: `Legalitt_Receipt_${row.id.slice(0, 8).toUpperCase()}.pdf`, pdf_base64: Buffer.from(await pdf.save()).toString('base64')};
  }
}
