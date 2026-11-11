import {Body, ConflictException, Controller, ForbiddenException, Get, Inject, Injectable, NotFoundException, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {ACCOUNT_DELETION_OPEN, AdminDeletionDecisionSchema, type AdminDeletionRow} from '@legalitt/shared';
import {AuthGuard, Roles, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {PrismaService} from '../prisma.service';
import type {CaseActor} from '../cases/case-access';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

/** Same set the client-side request checks (D-24). */
const ACTIVE_PAID = ['paid', 'assigning', 'assigned', 'advocate_accepted', 'advocate_declined', 'in_progress', 'client_review',
  'changes_requested', 'approved', 'dispatching', 'dispatched'] as const;

// D-24 / D-42 / D-89 / D-90 / D-92: admin queue for account deletion requests.
// pending → reviewed → completed_pending_purge. "Complete" keeps the account
// deactivated and marks the personal-data purge as pending; it never erases rows
// or the Cognito user — the purge waits for the retention period (DECISIONS §12
// open question). "Reactivate" closes the request as declined and restores sign-in.
@Injectable()
export class AccountDeletionsAdminService {
  constructor(private readonly prisma: PrismaService, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  private admin(actor: CaseActor) {if (actor.role !== 'admin') throw new ForbiddenException('Admin access required');}

  async list(actor: CaseActor, status: 'open' | 'decided' = 'open'): Promise<{items: AdminDeletionRow[]}> {
    this.admin(actor);
    const db = await this.prisma.getClient();
    const open = [...ACCOUNT_DELETION_OPEN];
    const rows = await db.accountDeletionRequest.findMany({where: status === 'open' ? {status: {in: open}} : {status: {notIn: open}},
      orderBy: status === 'open' ? [{created_at: 'asc'}, {id: 'asc'}] : [{completed_at: 'desc'}, {id: 'asc'}], take: 200});
    const users = await db.user.findMany({where: {id: {in: rows.map(r => r.user_id)}}, select: {id: true, full_name: true, email: true, phone: true, role: true, status: true}});
    const cases = await db.case.findMany({where: {client_id: {in: rows.map(r => r.user_id)}}, select: {id: true, client_id: true, reference: true, service_code: true, status: true}, orderBy: {created_at: 'asc'}});
    const actions = await db.adminAction.findMany({where: {subject_type: 'account_deletion_request', subject_id: {in: rows.map(r => r.id)}}, orderBy: {id: 'desc'}});
    return {items: rows.map(r => {
      const u = users.find(x => x.id === r.user_id), action = actions.find(a => a.subject_id === r.id);
      const mine = cases.filter(c => c.client_id === r.user_id);
      return {id: r.id, status: r.status, reason: r.reason, requested_at: r.created_at.toISOString(), decided_at: r.completed_at?.toISOString() ?? null,
        decision_note: (action?.payload as {note?: string} | undefined)?.note ?? null,
        user: {id: r.user_id, name: u?.full_name ?? 'Unknown user', email: u?.email ?? null, phone: u?.phone ?? null, role: u?.role ?? null, account_status: u?.status ?? null},
        cases: mine.map(c => ({id: c.id, reference: c.reference, service_code: c.service_code, status: c.status})),
        blockers: mine.filter(c => (ACTIVE_PAID as readonly string[]).includes(c.status)).map(c => ({id: c.id, reference: c.reference, service_code: c.service_code, status: c.status}))};
    })};
  }

  async decide(actor: CaseActor, id: string, body: unknown) {
    this.admin(actor);
    const input = parse(AdminDeletionDecisionSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const locked = await tx.$queryRaw<{id: string}[]>`SELECT id FROM account_deletion_requests WHERE id = ${id}::uuid FOR UPDATE`;
      if (!locked.length) throw new NotFoundException('Request not found');
      const row = await tx.accountDeletionRequest.findUniqueOrThrow({where: {id}});
      if (!(ACCOUNT_DELETION_OPEN as readonly string[]).includes(row.status)) throw new ConflictException('This request has already been decided. Refresh the queue.');
      if (input.decision === 'review' && row.status !== 'pending') throw new ConflictException('This request is already marked reviewed. Refresh the queue.');
      const now = new Date();
      if (input.decision === 'review') {
        // Still open and still oldest-first; the account stays deactivated.
        await tx.accountDeletionRequest.update({where: {id}, data: {status: 'reviewed'}});
      } else if (input.decision === 'complete') {
        if (await tx.case.count({where: {client_id: row.user_id, status: {in: [...ACTIVE_PAID]}}}))
          throw new ConflictException('This client has a paid case in progress. Resolve or cancel it before completing the deletion.');
        await tx.accountDeletionRequest.update({where: {id}, data: {status: 'completed_pending_purge', completed_at: now}});
        await tx.user.update({where: {id: row.user_id}, data: {status: 'deactivated', updated_at: now}});
      } else {
        await tx.accountDeletionRequest.update({where: {id}, data: {status: 'declined', completed_at: now}});
        await tx.user.update({where: {id: row.user_id}, data: {status: 'active', updated_at: now}});
        await this.notifications.send(tx, {user_id: row.user_id, kind: 'account_reactivated', title: 'Your account has been reactivated', body: input.note});
      }
      const status = {review: 'reviewed', complete: 'completed_pending_purge', reactivate: 'declined'}[input.decision];
      await tx.adminAction.create({data: {admin_id: actor.id, action: {review: 'review_account_deletion', complete: 'complete_account_deletion', reactivate: 'reactivate_account'}[input.decision],
        subject_type: 'account_deletion_request', subject_id: id, payload: {user_id: row.user_id, note: input.note, from_status: row.status, to_status: status, erased: false}}});
      return {id, status};
    });
  }
}

@Controller('api/v1/admin/account-deletions') @UseGuards(AuthGuard)
export class AccountDeletionsAdminController {
  constructor(private readonly service: AccountDeletionsAdminService) {}
  @Get() @Roles('admin') list(@Req() req: AuthRequest, @Query() query: unknown) {
    return this.service.list(req.user!, parse(z.strictObject({status: z.enum(['open', 'decided']).optional()}), query ?? {}).status);
  }
  @Post(':id/decide') @Roles('admin') decide(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {
    return this.service.decide(req.user!, parse(z.uuid(), v), body);
  }
}
