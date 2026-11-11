import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import {
  AccessTokenSchema, AccountPreferencesPatchSchema, ChangePasswordSchema, DeletionRequestSchema, NOTIFICATION_CATEGORIES,
  type AccountPreferences, type AccountSecurity, type DeletionState, type NotificationCategory, type SavedAdvocate,
} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {caseScope, type CaseActor} from '../cases/case-access';
import {activeAt, newest} from '../payments/price-quotes';
import {calculateQuote} from '../payments/quote-math';
import {ACCOUNT_COGNITO, type AccountCognitoPort} from './account-cognito';

const DEMO_DOMAIN = '@legalitt.invalid';
/** Cases with paid work under way block deletion (D-24). */
const ACTIVE_PAID = ['paid', 'assigning', 'assigned', 'advocate_accepted', 'advocate_declined', 'in_progress', 'client_review',
  'changes_requested', 'approved', 'dispatching', 'dispatched'] as const;

export function preferenceValues(row: {language: string; notifications: unknown} | null): AccountPreferences {
  const stored = (row?.notifications ?? {}) as Partial<Record<NotificationCategory, boolean>>;
  return {language: row?.language ?? 'en',
    notifications: Object.fromEntries(NOTIFICATION_CATEGORIES.map(c => [c.code, stored[c.code] !== false])) as AccountPreferences['notifications']};
}
function tokenSub(token: string) {
  try { return JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()).sub as string | undefined; }
  catch { return undefined; }
}
function device(agent: string | null) {
  if (!agent) return null;
  if (/iPhone|iPad|iOS/i.test(agent)) return 'iPhone or iPad';
  if (/Android/i.test(agent)) return 'Android device';
  if (/Windows|Macintosh|Linux|CrOS/i.test(agent)) return 'Web browser';
  return null;
}

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService, @Inject(ACCOUNT_COGNITO) private readonly cognito: AccountCognitoPort) {}

  async preferences(actor: CaseActor) {
    const db = await this.prisma.getClient();
    return preferenceValues(await db.userPreference.findUnique({where: {user_id: actor.id}}));
  }
  async updatePreferences(actor: CaseActor, body: unknown) {
    const input = parse(AccountPreferencesPatchSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const current = preferenceValues(await tx.userPreference.findUnique({where: {user_id: actor.id}}));
      const next = {language: input.language ?? current.language, notifications: {...current.notifications, ...input.notifications}};
      await tx.userPreference.upsert({where: {user_id: actor.id},
        create: {user_id: actor.id, language: next.language, notifications: next.notifications},
        update: {language: next.language, notifications: next.notifications, updated_at: new Date()}});
      return next;
    });
  }

  private async user(actor: CaseActor) {
    const db = await this.prisma.getClient();
    const user = await db.user.findUnique({where: {id: actor.id}});
    if (!user) throw new NotFoundException('Account not found');
    return user;
  }

  async security(actor: CaseActor): Promise<AccountSecurity> {
    const user = await this.user(actor);
    const db = await this.prisma.getClient();
    const events = await db.authEvent.findMany({where: {user_id: actor.id, event: {in: ['password_login', 'otp_verified']}},
      orderBy: {created_at: 'desc'}, take: 10});
    const latest = events[0];
    return {
      email: user.email, email_verified: user.email_verified, phone: user.phone, phone_verified: user.phone_verified,
      password_change: user.email?.toLowerCase().endsWith(DEMO_DOMAIN) ? 'demo_managed'
        : latest?.event === 'otp_verified' ? 'one_time_code' : 'available',
      sessions: events.map(e => ({id: e.id.toString(), method: e.event === 'otp_verified' ? 'one_time_code' : 'password',
        device: device(e.user_agent), at: e.created_at.toISOString()})),
    };
  }

  private async ownToken(actor: CaseActor, token: string) {
    const user = await this.user(actor);
    // The access token must belong to the signed-in identity; Cognito verifies its signature.
    if (tokenSub(token) !== user.cognito_sub) throw new ForbiddenException('Sign in again to continue.');
    return user;
  }

  async changePassword(actor: CaseActor, body: unknown) {
    const input = parse(ChangePasswordSchema, body);
    const security = await this.security(actor);
    if (security.password_change === 'demo_managed') throw new ConflictException('This demo account’s password is managed by Legalitt and can’t be changed in the app.');
    if (security.password_change === 'one_time_code') throw new ConflictException('You sign in with a one-time code, so there is no password to change.');
    await this.ownToken(actor, input.access_token);
    try { await this.cognito.changePassword(input.access_token, input.current_password, input.new_password); }
    catch (e) {
      const name = (e as {name?: string}).name;
      if (name === 'NotAuthorizedException') throw new BadRequestException('Your current password is incorrect.');
      if (name === 'InvalidPasswordException') throw new BadRequestException('The new password doesn’t meet the requirements.');
      if (name === 'LimitExceededException') throw new BadRequestException('Too many attempts. Wait a few minutes and try again.');
      throw new BadRequestException('Your password couldn’t be changed. Try again.');
    }
    return {changed: true};
  }

  async signOutEverywhere(actor: CaseActor, body: unknown) {
    const {access_token} = parse(AccessTokenSchema, body);
    await this.ownToken(actor, access_token);
    try { await this.cognito.globalSignOut(access_token); }
    catch { throw new BadRequestException('Couldn’t sign out of other devices. Try again.'); }
    return {signed_out: true};
  }

  async exportData(actor: CaseActor) {
    const db = await this.prisma.getClient();
    const user = await this.user(actor);
    const scope = caseScope(actor);
    const cases = await db.case.findMany({where: scope, orderBy: {created_at: 'asc'},
      select: {id: true, reference: true, service_code: true, status: true, tier: true, matter_type: true, created_at: true, completed_at: true,
        details: actor.role === 'client', subject_matter: actor.role === 'client'}});
    const ids = cases.map(c => c.id);
    const payments = await db.payment.findMany({where: {payer_id: actor.id, case_id: {in: ids}}, orderBy: {created_at: 'asc'},
      select: {id: true, case_id: true, purpose: true, base_amount_paise: true, gst_paise: true, total_paise: true, status: true, simulated: true, created_at: true, captured_at: true}});
    const messages = await db.message.findMany({where: {thread_id_relation: {is: {case_id: {in: ids}, kind: 'client_advocate'}}},
      orderBy: {created_at: 'asc'}, select: {id: true, sender_id: true, body: true, created_at: true, thread_id_relation: {select: {case_id: true}}}});
    const saved = await db.savedAdvocate.findMany({where: {user_id: actor.id}});
    return {
      exported_at: new Date().toISOString(),
      profile: {name: user.full_name, email: user.email, phone: user.phone, role: user.role, created_at: user.created_at},
      preferences: preferenceValues(await db.userPreference.findUnique({where: {user_id: actor.id}})),
      cases, payments,
      messages: messages.map(m => ({id: m.id, case_id: m.thread_id_relation.case_id, from_you: m.sender_id === actor.id, body: m.body, created_at: m.created_at})),
      saved_advocates: saved.map(s => ({advocate_id: s.advocate_id, saved_at: s.created_at})),
    };
  }

  async deletionState(actor: CaseActor): Promise<DeletionState> {
    const db = await this.prisma.getClient();
    const request = await db.accountDeletionRequest.findFirst({where: {user_id: actor.id}, orderBy: {created_at: 'desc'}});
    const blockers = await db.case.findMany({where: {AND: [caseScope(actor), {status: {in: [...ACTIVE_PAID]}}]},
      select: {id: true, reference: true, service_code: true, status: true}, orderBy: {created_at: 'asc'}});
    return {request: request ? {id: request.id, status: request.status, created_at: request.created_at.toISOString()} : null, blockers};
  }

  async requestDeletion(actor: CaseActor, body: unknown) {
    const input = parse(DeletionRequestSchema, body);
    if (input.access_token) await this.ownToken(actor, input.access_token);
    const db = await this.prisma.getClient();
    const created = await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${actor.id}::uuid FOR UPDATE`;
      if (await tx.case.count({where: {AND: [caseScope(actor), {status: {in: [...ACTIVE_PAID]}}]}}))
        throw new ConflictException('You have a paid case in progress. Cancel it or wait until it completes, then request deletion.');
      if (await tx.accountDeletionRequest.findFirst({where: {user_id: actor.id, status: 'pending'}}))
        throw new ConflictException('A deletion request is already pending for this account.');
      const row = await tx.accountDeletionRequest.create({data: {user_id: actor.id, reason: input.reason || null}});
      // Deactivated immediately: identity() refuses non-active users on every request.
      await tx.user.update({where: {id: actor.id}, data: {status: 'deactivated', updated_at: new Date()}});
      return row;
    });
    if (input.access_token) await this.cognito.globalSignOut(input.access_token).catch(() => undefined);
    return {id: created.id, status: created.status, created_at: created.created_at.toISOString()};
  }

  private async consultationTotal() {
    const db = await this.prisma.getClient(), now = new Date();
    const row = await db.servicePricing.findFirst({where: {service_code: 'legal_advice', confirmed: true, fee_policy_id: {not: null}, ...activeAt(now)},
      orderBy: newest, include: {fee_policy: {include: {page_overage_policy: true}}}});
    const commission = await db.commissionRate.findFirst({where: {service_code: 'legal_advice', confirmed: true, ...activeAt(now)}, orderBy: newest});
    if (!row?.fee_policy || !commission) return null;
    const page = row.fee_policy.page_overage_policy;
    return calculateQuote({base: row.base_amount_paise, commissionBps: commission.rate_bps, gstBps: row.gst_bps, delivery: 0n, pages: 0,
      includedPages: page.included_pages, pagePrice: page.unit_amount_paise, pageGstBps: page.gst_bps}).total_paise;
  }

  async savedAdvocates(actor: CaseActor): Promise<{items: SavedAdvocate[]}> {
    if (actor.role !== 'client') throw new ForbiddenException('Clients save advocates');
    const db = await this.prisma.getClient();
    const saved = await db.savedAdvocate.findMany({where: {user_id: actor.id}, orderBy: {created_at: 'desc'}});
    const ids = saved.map(s => s.advocate_id);
    // Only currently active, approved advocates are shown; others drop out silently.
    const users = await db.user.findMany({where: {id: {in: ids}, role: 'advocate', status: 'active', advocate_profiles_user_id_relations: {is: {verification: 'approved'}}},
      select: {id: true, full_name: true, advocate_profiles_user_id_relations: {select: {city: true, state: true, practice_areas: true, years_experience: true}}}});
    const hours = await db.advocateAvailability.findMany({where: {advocate_id: {in: ids}}, distinct: ['advocate_id'], orderBy: [{advocate_id: 'asc'}, {version: 'desc'}]});
    const total = await this.consultationTotal();
    const items: SavedAdvocate[] = [];
    for (const s of saved) {
      const u = users.find(x => x.id === s.advocate_id); if (!u) continue;
      const p = u.advocate_profiles_user_id_relations;
      const intervals = (hours.find(h => h.advocate_id === u.id)?.intervals ?? []) as {day: number}[];
      items.push({id: u.id, name: u.full_name, city: p?.city ?? null, state: p?.state ?? null, practice_areas: p?.practice_areas ?? [],
        years_experience: p?.years_experience ?? null, verified: true, available_days: [...new Set(intervals.map(i => i.day))].sort(),
        consultation_total_paise: total, saved_at: s.created_at.toISOString()});
    }
    return {items};
  }
  async saveAdvocate(actor: CaseActor, advocateId: string) {
    if (actor.role !== 'client') throw new ForbiddenException('Clients save advocates');
    parse(z.uuid(), advocateId);
    const db = await this.prisma.getClient();
    if (!await db.user.findFirst({where: {id: advocateId, role: 'advocate', status: 'active', advocate_profiles_user_id_relations: {is: {verification: 'approved'}}}}))
      throw new NotFoundException('Advocate not found');
    await db.savedAdvocate.upsert({where: {user_id_advocate_id: {user_id: actor.id, advocate_id: advocateId}}, create: {user_id: actor.id, advocate_id: advocateId}, update: {}});
    return {saved: true};
  }
  async unsaveAdvocate(actor: CaseActor, advocateId: string) {
    if (actor.role !== 'client') throw new ForbiddenException('Clients save advocates');
    parse(z.uuid(), advocateId);
    const db = await this.prisma.getClient();
    await db.savedAdvocate.deleteMany({where: {user_id: actor.id, advocate_id: advocateId}});
    return {saved: false};
  }
}
