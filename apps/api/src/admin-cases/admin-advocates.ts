import { Controller, ForbiddenException, Get, Injectable, Req, UseGuards } from '@nestjs/common';
import { CaseStatus, adminBucketFor, type AdminAdvocate } from '@legalitt/shared';
import { PrismaService } from '../prisma.service';
import { AuthGuard, Roles, type AuthRequest } from '../auth/auth.controller';
import type { CaseActor } from '../cases/case-access';

// Assigned work, including waiting for client review/transit, across services.
// Declined work is not this advocate's workload, even if the old id is retained.
const workload = Object.values(CaseStatus).filter(status =>
  ['pending', 'in_progress'].includes(adminBucketFor(status) ?? ''));
@Injectable()
export class AdminAdvocatesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async list(actor: CaseActor): Promise<{items: AdminAdvocate[]}> {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin access required');
    const db = await this.prisma.getClient();
    const rows = await db.user.findMany({
      where: {role: 'advocate', status: 'active', advocate_profiles_user_id_relations: {is: {verification: 'approved'}}},
      select: {id: true, full_name: true,
        advocate_profiles_user_id_relations: {select: {practice_areas: true, city: true}},
        _count: {select: {cases_advocate_id_relations: {where: {status: {in: workload}}}}}},
      orderBy: [{full_name: 'asc'}, {id: 'asc'}],
    });
    const items = rows.map(row => ({id: row.id, name: row.full_name,
      practice_areas: row.advocate_profiles_user_id_relations!.practice_areas,
      city: row.advocate_profiles_user_id_relations!.city,
      open_cases: row._count.cases_advocate_id_relations}));
    return {items: items.sort((a, b) => a.open_cases - b.open_cases || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))};
  }
}
@Controller('api/v1/admin/advocates')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminAdvocatesController {
  constructor(private readonly advocates: AdminAdvocatesRepository) {}
  @Get() list(@Req() req: AuthRequest) { return this.advocates.list(req.user!); }
}
