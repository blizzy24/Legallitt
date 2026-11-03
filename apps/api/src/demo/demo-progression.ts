import { Inject, Injectable, Logger, Optional, type OnApplicationBootstrap, type OnModuleDestroy } from '@nestjs/common';
import { z } from 'zod';
import { IN_FLIGHT_SHIPMENT_STATUSES, NOTICE_ADVOCATE_GREETING, nextShipmentStatus, type ApiCase, type ShipmentStatus } from '@legalitt/shared';
import { PrismaService } from '../prisma.service';
import { demoPassword } from '../phone-auth/demo-accounts';
import { ADMIN_UI, type AdminUiPort } from '../admin-ui/admin-ui.port';
import { SystemTrigger } from '../admin-ui/system-trigger';
import { DEMO_PROGRESSION_CONFIG, type DemoProgressionConfig } from './demo-config';
import { simulatedDraft } from './simulated-draft';

// §2.12. A stand-in for the PEOPLE who have no screen yet (an admin) or are not
// present (an offline advocate) — never for the system. Every step signs in as
// the seeded person and calls the endpoint that person will call. Nothing here
// writes to the database or sets a status; the app finds out by reading the case.
const seeded = {
  admin: 'demo-admin@legalitt.invalid',
  advocate: 'demo-advocate@legalitt.invalid',
} as const;
type Actor = keyof typeof seeded;
type Session = {id: string; role: Actor; idToken: string; expires: number};
const sessionSchema = z.object({
  user: z.object({id: z.uuid(), role: z.enum(['admin', 'advocate'])}),
  tokens: z.object({idToken: z.string().min(1), expiresIn: z.number()}),
});
const uuid = '[0-9a-f-]{36}';
// Status events are when a case entered its current state; courier milestones
// restart the clock for the next milestone. Other events do not.
const clockEvents = ['status_changed', 'payment_captured', 'shipment_status_changed'];

@Injectable()
export class DemoProgression implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(DemoProgression.name);
  private timer?: NodeJS.Timeout;
  private ticking = false;
  private readonly retryAt = new Map<string, number>();
  private readonly sessions = new Map<Actor, Session>();
  constructor(
    private readonly prisma: PrismaService,
    private readonly trigger: SystemTrigger,
    @Inject(ADMIN_UI) private readonly adminUi: AdminUiPort,
    @Optional() @Inject(DEMO_PROGRESSION_CONFIG) private readonly config: DemoProgressionConfig | null,
  ) {}
  onApplicationBootstrap() {
    if (!this.config) return;
    this.logger.log(`DEMO_PROGRESSION=on: enabled steps ${Object.entries(this.config).filter(([, delay]) => delay !== null).map(([name]) => name.replace(/DelayMs$|StepMs$/, '')).join(', ')} (architecture §2.12)`);
    this.timer = setInterval(() => void this.tick(), 1000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /** Which person acts on a case in this state, and after how long. */
  private due(status: string, shipmentStatus?: string): {actor: Actor; after: number} | null {
    const c = this.config;
    if (!c) return null;
    const enabled = (actor: Actor, after: number | null) => after === null ? null : {actor, after};
    switch (status) {
      case 'paid': return enabled('admin', c.assignDelayMs);
      case 'assigned':
      case 'advocate_accepted':
      // A client's change request leaves the same advocate to resume drafting.
      case 'changes_requested': return enabled('advocate', c.draftStartDelayMs);
      case 'in_progress': return enabled('advocate', c.draftDoneDelayMs);
      // The advocate books the courier and confirms dispatch; with no human
      // advocate the approved case would otherwise strand.
      case 'approved': return enabled('advocate', c.dispatchDelayMs);
      case 'dispatched': {
        if (!shipmentStatus || !IN_FLIGHT_SHIPMENT_STATUSES.includes(shipmentStatus as ShipmentStatus)) return null;
        const next = nextShipmentStatus(shipmentStatus as ShipmentStatus);
        return next ? enabled('admin', next === 'delivered' ? c.deliveryConfirmDelayMs : c.shipmentStepMs) : null;
      }
      default: return null;
    }
  }

  async tick() {
    if (!this.config || this.ticking) return;
    this.ticking = true;
    try {
      const db = await this.prisma.getClient();
      const rows = await db.case.findMany({
        where: {service_code: 'legal_notice', status: {in: ['paid', 'assigned', 'advocate_accepted', 'changes_requested', 'in_progress', 'approved', 'dispatched']}},
        select: {id: true, status: true, advocate_id: true,
          shipments_case_id_relations: {where: {direction: 'to_recipient'}, orderBy: {booked_at: {sort: 'desc', nulls: 'last'}}, take: 1, select: {status: true}},
          case_events_case_id_relations: {
          where: {type: {in: clockEvents}}, orderBy: {id: 'desc'}, take: 1, select: {created_at: true},
        }},
      });
      const now = Date.now();
      for (const row of rows) {
        const step = this.due(row.status, row.shipments_case_id_relations[0]?.status);
        const since = row.case_events_case_id_relations[0]?.created_at.getTime();
        if (!step || since === undefined || now < since + step.after || (this.retryAt.get(row.id) ?? 0) > now) continue;
        try {
          const session = await this.session(step.actor);
          // The seeded advocate only works on cases assigned to it.
          if (step.actor === 'advocate' && row.advocate_id !== session.id) continue;
          await this.act(row.id, row.status, session);
          this.retryAt.delete(row.id);
        } catch (error) {
          this.retryAt.set(row.id, Date.now() + Math.max(step.after, 5000));
          this.logger.warn(`Case ${row.id} (${row.status}) step failed: ${error instanceof Error ? error.message : 'UnknownError'}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Demo progression read failed: ${error instanceof Error ? error.name : 'UnknownError'}`);
    } finally {
      this.ticking = false;
    }
  }

  private async act(caseId: string, status: string, session: Session) {
    const cases = `/api/v1/cases/${caseId}`;
    switch (status) {
      case 'paid':
        return this.call(session, caseId, [new RegExp(`^/api/v1/admin/cases/${caseId}/assign$`)], async post => {
          await post(`/api/v1/admin/cases/${caseId}/assign`, {advocate_id: (await this.session('advocate')).id});
        });
      case 'assigned':
        await this.call(session, caseId, [new RegExp(`^${cases}/(accept|start)$`)], async post => {
          await post(`${cases}/accept`, {});
          await post(`${cases}/start`, {});
        });
        return this.greet(session, caseId);
      case 'advocate_accepted':
      case 'changes_requested':
        return this.call(session, caseId, [new RegExp(`^${cases}/start$`)], post => post(`${cases}/start`, {}));
      case 'in_progress': {
        const record = await this.read(session, caseId);
        const sent = new Set((record.events ?? []).filter(e => e.to_status === 'client_review').map(e => e.payload.draft_id));
        const latest = record.drafts?.at(-1);
        return this.call(session, caseId, [new RegExp(`^${cases}/drafts(/${uuid}/send)?$`)], async post => {
          // Send the advocate's own unsent version if there is one; otherwise
          // resubmit the last version, or the labelled placeholder for a first draft.
          const draft = latest && !sent.has(latest.id) ? latest
            : z.object({id: z.uuid()}).parse(await post(`${cases}/drafts`, {kind: 'legal_notice', content: latest?.content ?? simulatedDraft, generated_by: 'manual'}));
          await post(`${cases}/drafts/${draft.id}/send`, {});
        });
      }
      case 'approved': {
        // §2.11: the courier details are a labelled placeholder, never a real carrier's name.
        const record = await this.read(session, caseId);
        const today = new Date().toISOString().slice(0, 10);
        return this.call(session, caseId, [new RegExp(`^${cases}/(shipment/book|dispatch)$`)], async post => {
          await post(`${cases}/shipment/book`, {carrier: 'SIMULATED COURIER', waybill: `SIMULATED-${record.reference}`, dispatch_date: today});
          await post(`${cases}/dispatch`, {});
        });
      }
      case 'dispatched': {
        const record = await this.read(session, caseId);
        const shipment = record.shipments?.filter(s => s.direction === 'to_recipient').sort((a, b) => (b.booked_at ?? '').localeCompare(a.booked_at ?? ''))[0];
        const next = shipment && nextShipmentStatus(shipment.status as ShipmentStatus);
        // Recheck the current shipment, not just the earlier poll. Courier
        // milestones must never slip through into admin confirmation.
        if (!next || !this.due('dispatched', shipment.status)) return;
        if (next === 'delivered') return this.adminUi.confirmDelivery(caseId);
        return this.call(session, caseId, [new RegExp(`^/api/v1/admin/cases/${caseId}/shipment/status$`)], post =>
          post(`/api/v1/admin/cases/${caseId}/shipment/status`, {status: next}));
      }
    }
  }

  /** The advocate's drawn opening message (33, 439), sent once through the real messages endpoint. */
  private async greet(session: Session, caseId: string) {
    const get = async (path: string) => {
      const response = await fetch(this.base() + path, {headers: {Authorization: `Bearer ${session.idToken}`}});
      if (!response.ok) throw new Error(`GET ${path.replace(caseId, ':id')}: HTTP ${response.status}`);
      return response.json();
    };
    const thread = z.object({id: z.uuid()}).parse(await get(`/api/v1/cases/${caseId}/thread`));
    const page = z.object({items: z.array(z.object({sender_id: z.string()}))}).parse(await get(`/api/v1/threads/${thread.id}/messages`));
    if (page.items.some(m => m.sender_id === session.id)) return;
    await this.call(session, caseId, [new RegExp(`^/api/v1/threads/${thread.id}/messages$`)], post =>
      post(`/api/v1/threads/${thread.id}/messages`, {body: NOTICE_ADVOCATE_GREETING}));
  }
  private base() { return `http://127.0.0.1:${process.env.PORT}`; }
  private async session(actor: Actor) {
    const cached = this.sessions.get(actor);
    if (cached && cached.expires > Date.now()) return cached;
    const response = await fetch(`${this.base()}/api/v1/auth/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: seeded[actor], password: await demoPassword()}),
    });
    if (!response.ok) throw new Error(`Sign-in as seeded ${actor}: HTTP ${response.status}`);
    const parsed = sessionSchema.parse(await response.json());
    if (parsed.user.role !== actor) throw new Error(`Seeded ${actor} has role ${parsed.user.role}`);
    const session = {id: parsed.user.id, role: actor, idToken: parsed.tokens.idToken, expires: Date.now() + (parsed.tokens.expiresIn - 60) * 1000};
    this.sessions.set(actor, session);
    return session;
  }
  private async read(session: Session, caseId: string) {
    const response = await fetch(`${this.base()}/api/v1/cases/${caseId}`, {headers: {Authorization: `Bearer ${session.idToken}`}});
    if (!response.ok) throw new Error(`GET case: HTTP ${response.status}`);
    return (await response.json()) as ApiCase;
  }
  /** One step: a provenance ticket for exactly these routes, then the real calls. */
  private async call(session: Session, caseId: string, paths: RegExp[], step: (post: (path: string, body: unknown) => Promise<unknown>) => Promise<unknown>) {
    const ticket = this.trigger.issueScoped(session, caseId, paths);
    try {
      await step(async (path, body) => {
        const response = await fetch(this.base() + path, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', Authorization: `Bearer ${session.idToken}`, 'X-System-Trigger': ticket},
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`POST ${path.replace(caseId, ':id')}: HTTP ${response.status}`);
        return response.json();
      });
    } finally {
      this.trigger.revoke(ticket);
    }
  }
}
