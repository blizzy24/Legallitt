import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles, type AuthRequest } from '../auth/auth.controller';
import { AdminCasesRepository } from './admin-cases.repository';
@Controller('api/v1/admin/cases')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminCasesController {
  constructor(private readonly cases: AdminCasesRepository) {}
  @Get() list(@Req() req: AuthRequest, @Query() query: unknown) {
    return this.cases.list(req.user!, query);
  }
}
