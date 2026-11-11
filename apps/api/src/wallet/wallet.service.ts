import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {
  BankAccountInputSchema, PAYOUT_MINIMUM_PAISE, PayoutPaidInputSchema, PayoutRequestInputSchema, maskAccount,
  type AdminPayoutRow, type MaskedBankAccount, type PayoutRequestView, type QuoteBreakdown, type Wallet, type WalletEntry, type WalletPeriod,
} from '@legalitt/shared';
import {z} from 'zod';
import type {Prisma} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

type Tx = Prisma.TransactionClient;
const periodStart = (period: WalletPeriod, now = new Date()): [Date | null, Date | null] => {
  // Calendar periods in IST, the product's operating timezone.
  const ist = new Date(now.getTime() + 330 * 60000), y = ist.getUTCFullYear(), m = ist.getUTCMonth();
  const at = (yy: number, mm: number) => new Date(Date.UTC(yy, mm, 1) - 330 * 60000);
  if (period === 'month') return [at(y, m), null];
  if (period === 'last_month') return [at(y, m - 1), at(y, m)];
  if (period === 'year') return [at(y, 0), null];
  return [null, null];
};
const within = (d: Date | null, [from, to]: [Date | null, Date | null]) => !!d && (!from || d >= from) && (!to || d < to);
const masked = (b: {holder_name: string; bank_name: string; ifsc: string; account_number: string; account_type: string | null; updated_at: Date}): MaskedBankAccount =>
  ({holder_name: b.holder_name, bank_name: b.bank_name, ifsc: b.ifsc, account_last4: maskAccount(b.account_number), account_type: b.account_type, verified: false, updated_at: b.updated_at.toISOString()});
const requestView = (r: {id: string; amount_paise: bigint; status: string; requested_at: Date; utr: string | null; paid_on: Date | null; paid_at: Date | null; bank_snapshot: unknown}): PayoutRequestView => {
  const b = r.bank_snapshot as {bank_name?: string; account_number?: string};
  return {id: r.id, amount_paise: r.amount_paise.toString(), status: r.status === 'paid' ? 'paid' : 'pending', requested_at: r.requested_at.toISOString(),
    utr: r.utr, paid_on: r.paid_on?.toISOString().slice(0, 10) ?? null, paid_at: r.paid_at?.toISOString() ?? null,
    bank: {bank_name: b.bank_name ?? '', account_last4: maskAccount(b.account_number ?? '')}};
};

/** D-36/D-82: entitlements are read from captured price snapshots, never stored twice. */
export async function walletEntries(tx: Tx, advocateId: string): Promise<WalletEntry[]> {
  const cases = await tx.case.findMany({where: {advocate_id: advocateId, status: 'completed'},
    select: {id: true, reference: true, service_code: true, completed_at: true,
      payments_case_id_relations: {where: {status: 'captured', purpose: {in: ['service_fee', 'representation']}}, select: {total_paise: true, quote: {select: {snapshot: true}}}}}});
  const out: WalletEntry[] = [];
  for (const c of cases) {
    let share = 0n, paid = 0n, platform = 0n, gst = 0n, known = false;
    for (const p of c.payments_case_id_relations) {
      const b = (p.quote?.snapshot as {breakdown?: QuoteBreakdown} | undefined)?.breakdown;
      // §2.5a: historical payments without a recorded entitlement stay unknown, not zero.
      if (!b?.advocate_entitlement_paise) continue;
      known = true; share += BigInt(b.advocate_entitlement_paise); paid += p.total_paise;
      platform += BigInt(b.platform_fee_paise); gst += BigInt(b.gst_paise) + BigInt(b.page_overage_gst_paise ?? '0');
    }
    if (known) out.push({case_id: c.id, reference: c.reference, service_code: c.service_code, completed_at: c.completed_at?.toISOString() ?? null,
      client_paid_paise: paid.toString(), platform_fee_paise: platform.toString(), gst_paise: gst.toString(), share_paise: share.toString(), source: 'completed'});
  }
  // D-14/D-55: a cancelled case carries an entitlement only when the admin set one.
  const decisions = await tx.cancellationRequest.findMany({where: {advocate_entitlement_paise: {gt: 0n}, status: {in: ['approved', 'completed']}}});
  if (decisions.length) {
    const own = await tx.case.findMany({where: {id: {in: decisions.map(d => d.case_id)}, advocate_id: advocateId}, select: {id: true, reference: true, service_code: true}});
    for (const d of decisions) {
      const c = own.find(x => x.id === d.case_id);
      if (c) out.push({case_id: c.id, reference: c.reference, service_code: c.service_code, completed_at: (d.decided_at ?? d.requested_at).toISOString(),
        client_paid_paise: '0', platform_fee_paise: '0', gst_paise: '0', share_paise: d.advocate_entitlement_paise!.toString(), source: 'cancellation_decision'});
    }
  }
  return out.sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''));
}

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  private advocate(actor: CaseActor) { if (actor.role !== 'advocate') throw new ForbiddenException('Advocate access only'); }
  private admin(actor: CaseActor) { if (actor.role !== 'admin') throw new ForbiddenException('Admin access only'); }

  private async balances(tx: Tx, advocateId: string) {
    const entries = await walletEntries(tx, advocateId);
    const requests = await tx.payoutRequest.findMany({where: {advocate_id: advocateId}, orderBy: {requested_at: 'desc'}});
    const earned = entries.reduce((s, e) => s + BigInt(e.share_paise), 0n);
    const pending = requests.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount_paise, 0n);
    const paid = requests.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount_paise, 0n);
    return {entries, requests, earned, pending, paid, ready: earned - pending - paid};
  }

  async wallet(actor: CaseActor, query: unknown): Promise<Wallet> {
    this.advocate(actor);
    const {period} = parse(z.strictObject({period: z.enum(['month', 'last_month', 'year', 'all']).default('month')}), query ?? {});
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const b = await this.balances(tx, actor.id), range = periodStart(period);
      const entries = b.entries.filter(e => period === 'all' || within(e.completed_at ? new Date(e.completed_at) : null, range));
      const bank = await tx.advocateBankAccount.findUnique({where: {advocate_id: actor.id}});
      return {period, earned_paise: b.earned.toString(), ready_paise: (b.ready > 0n ? b.ready : 0n).toString(), requested_paise: b.pending.toString(),
        paid_paise: b.paid.toString(), period_earned_paise: entries.reduce((s, e) => s + BigInt(e.share_paise), 0n).toString(), entries,
        requests: b.requests.map(requestView), bank: bank ? masked(bank) : null, minimum_paise: PAYOUT_MINIMUM_PAISE};
    }, {isolationLevel: 'RepeatableRead'});
  }

  async bank(actor: CaseActor) {
    this.advocate(actor);
    const b = await (await this.prisma.getClient()).advocateBankAccount.findUnique({where: {advocate_id: actor.id}});
    return {bank: b ? masked(b) : null};
  }
  async saveBank(actor: CaseActor, body: unknown) {
    this.advocate(actor);
    const input = parse(BankAccountInputSchema, body);
    const db = await this.prisma.getClient();
    // D-84: stored so Legalitt can pay manually; returned masked; never marked verified (no penny-drop).
    const row = await db.advocateBankAccount.upsert({where: {advocate_id: actor.id},
      create: {advocate_id: actor.id, ...input, account_type: input.account_type ?? null, verified: false},
      update: {...input, account_type: input.account_type ?? null, verified: false, updated_at: new Date()}});
    return {bank: masked(row)};
  }

  async requestPayout(actor: CaseActor, body: unknown) {
    this.advocate(actor);
    const amount = BigInt(parse(PayoutRequestInputSchema, body).amount_paise);
    if (amount < BigInt(PAYOUT_MINIMUM_PAISE)) throw new BadRequestException('The minimum withdrawal is ₹1,000.');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      // Serialise one advocate's requests so two taps cannot both spend the same balance.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'payout:' + actor.id}))::text`;
      const bank = await tx.advocateBankAccount.findUnique({where: {advocate_id: actor.id}});
      if (!bank) throw new ConflictException('Add your bank account before requesting a withdrawal.');
      const b = await this.balances(tx, actor.id);
      if (amount > b.ready) throw new ConflictException(`You can withdraw up to ${formatRupees(b.ready > 0n ? b.ready : 0n)} right now.`);
      const row = await tx.payoutRequest.create({data: {advocate_id: actor.id, amount_paise: amount,
        bank_snapshot: {holder_name: bank.holder_name, bank_name: bank.bank_name, ifsc: bank.ifsc, account_number: bank.account_number, account_type: bank.account_type}}});
      for (const admin of await tx.user.findMany({where: {role: 'admin', status: 'active'}, select: {id: true}}))
        await this.notifications.send(tx, {user_id: admin.id, kind: 'payout_requested', title: 'Advocate payout requested', body: formatRupees(amount)});
      return requestView(row);
    });
  }

  async payoutRequest(actor: CaseActor, id: string) {
    this.advocate(actor);
    const row = await (await this.prisma.getClient()).payoutRequest.findFirst({where: {id, advocate_id: actor.id}});
    if (!row) throw new NotFoundException('Payout not found');
    return requestView(row);
  }

  async adminList(actor: CaseActor, query: unknown): Promise<{items: AdminPayoutRow[]; counts: {pending: number; paid: number}}> {
    this.admin(actor);
    const {status} = parse(z.strictObject({status: z.enum(['pending', 'paid']).default('pending')}), query ?? {});
    const db = await this.prisma.getClient();
    const rows = await db.payoutRequest.findMany({where: {status}, orderBy: status === 'pending' ? {requested_at: 'asc'} : {paid_at: 'desc'}, take: 200});
    const users = await db.user.findMany({where: {id: {in: rows.map(r => r.advocate_id)}}, select: {id: true, full_name: true, email: true}});
    const counts = {pending: await db.payoutRequest.count({where: {status: 'pending'}}), paid: await db.payoutRequest.count({where: {status: 'paid'}})};
    return {counts, items: rows.map(r => {
      const u = users.find(x => x.id === r.advocate_id), b = r.bank_snapshot as AdminPayoutRow['bank'];
      return {id: r.id, advocate: {id: r.advocate_id, name: u?.full_name ?? 'Advocate', email: u?.email ?? null}, amount_paise: r.amount_paise.toString(),
        status: r.status === 'paid' ? 'paid' : 'pending', requested_at: r.requested_at.toISOString(), paid_at: r.paid_at?.toISOString() ?? null,
        paid_on: r.paid_on?.toISOString().slice(0, 10) ?? null, utr: r.utr, bank: {...b, verified: false}};
    })};
  }

  async markPaid(actor: CaseActor, id: string, body: unknown) {
    this.admin(actor);
    const input = parse(PayoutPaidInputSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const locked = await tx.$queryRaw<{id: string}[]>`SELECT id FROM payout_requests WHERE id = ${id}::uuid FOR UPDATE`;
      if (!locked.length) throw new NotFoundException('Payout not found');
      const row = await tx.payoutRequest.findUniqueOrThrow({where: {id}});
      if (row.status === 'paid') {
        if (row.utr === input.utr) return requestView(row);
        throw new ConflictException('This payout is already recorded as paid with a different UTR.');
      }
      const now = new Date();
      const updated = await tx.payoutRequest.update({where: {id}, data: {status: 'paid', utr: input.utr, paid_on: input.paid_on ? new Date(input.paid_on + 'T00:00:00Z') : now,
        paid_by: actor.id, paid_at: now}});
      await tx.adminAction.create({data: {admin_id: actor.id, action: 'record_payout_paid', subject_type: 'payout_request', subject_id: id,
        payload: {utr: input.utr, paid_on: input.paid_on ?? null, amount_paise: row.amount_paise.toString(), simulated: false, money_moved_in_app: false}}});
      await this.notifications.send(tx, {user_id: row.advocate_id, kind: 'payout_paid', title: 'Payout sent', body: `${formatRupees(row.amount_paise)} · UTR ${input.utr}`});
      return requestView(updated);
    });
  }
}
const formatRupees = (p: bigint) => `₹${(p / 100n).toLocaleString('en-IN')}${p % 100n ? '.' + (p % 100n).toString().padStart(2, '0') : ''}`;
