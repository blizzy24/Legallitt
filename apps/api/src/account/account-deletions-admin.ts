import {Body, ConflictException, Controller, ForbiddenException, Get, Inject, Injectable, NotFoundException, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AdminDeletionDecisionSchema, type AdminDeletionRow} from '@legalitt/shared';
import {AuthGuard, Roles, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {PrismaService} from '../prisma.service';
import type {CaseActor} from '../cases/case-access';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

/** Same set the client-side request checks (D-24). */
const ACTIVE_PAID = ['paid', 'assigning', 'assigned', 'advocate_accepted', 'advocate_declined', 'in_progress', 'client_review',
  'changes_requested', 'approved', 'dispatching', 'dispatched'] as const;

// D-24 / D-42 / D-85 / D-86: admin queue for account deletion requests.
// "Complete" records the decision and keeps the account deactivated; it never
// erases rows or the Cognito user — erasure waits for the client's DPDP
// retention decision (DECISIONS §12 Q5). "Reactivate" restores sign-in.
@Injectable()
export class AccountDeletionsAdminService {
  constructor(private readonly prisma: PrismaService, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  private admin(actor: CaseActor) {if (actor.role !== 'admin') throw new ForbiddenException('Admin access required');}

  async list(actor: CaseActor, status: 'pending' | 'decided' = 'pending'): Promise<{items: AdminDeletionRow[]}> {
    this.admin(actor);
    const db = await this.prisma.getClient();
    const rows = await db.accountDeletionRequest.findMany({where: status === 'pending' ? {status: 'pending'} : {status: {not: 'pending'}},
      orderBy: status === 'pending' ? [{created_at: 'asc'}, {id: 'asc'}] : [{completed_at: 'desc'}, {id: 'asc'}], take: 200});
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
      if (row.status !== 'pending') throw new ConflictException('This request has already been decided. Refresh the queue.');
      const now = new Date();
      if (input.decision === 'complete') {
        if (await tx.case.count({where: {client_id: row.user_id, status: {in: [...ACTIVE_PAID]}}}))
          throw new ConflictException('This client has a paid case in progress. Resolve or cancel it before completing the deletion.');
        await tx.accountDeletionRequest.update({where: {id}, data: {status: 'completed', completed_at: now}});
        await tx.user.update({where: {id: row.user_id}, data: {status: 'deactivated', updated_at: now}});
      } else {
        await tx.accountDeletionRequest.update({where: {id}, data: {status: 'declined', completed_at: now}});
        await tx.user.update({where: {id: row.user_id}, data: {status: 'active', updated_at: now}});
        await this.notifications.send(tx, {user_id: row.user_id, kind: 'account_reactivated', title: 'Your account has been reactivated', body: input.note});
      }
      await tx.adminAction.create({data: {admin_id: actor.id, action: input.decision === 'complete' ? 'complete_account_deletion' : 'reactivate_account',
        subject_type: 'account_deletion_request', subject_id: id, payload: {user_id: row.user_id, note: input.note, erased: false}}});
      return {id, status: input.decision === 'complete' ? 'completed' : 'declined'};
    });
  }
}

@Controller('api/v1/admin/account-deletions') @UseGuards(AuthGuard)
export class AccountDeletionsAdminController {
  constructor(private readonly service: AccountDeletionsAdminService) {}
  @Get() @Roles('admin') list(@Req() req: AuthRequest, @Query() query: unknown) {
    return this.service.list(req.user!, parse(z.strictObject({status: z.enum(['pending', 'decided']).optional()}), query ?? {}).status);
  }
  @Post(':id/decide') @Roles('admin') decide(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {
    return this.service.decide(req.user!, parse(z.uuid(), v), body);
  }
}
