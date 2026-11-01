import { DocumentService } from '../documents/document.service';
import { parse } from '../auth/auth.service';
import { z } from 'zod';
import { AdminCaseDetailRepository } from './admin-case-detail';
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles, type AuthRequest } from '../auth/auth.controller';
import { AdminCasesRepository } from './admin-cases.repository';
@Controller('api/v1/admin/cases')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminCasesController {
  constructor(private readonly cases: AdminCasesRepository, private readonly detail: AdminCaseDetailRepository, private readonly documents: DocumentService) {}
  @Get('documents/:documentId/preview') preview(@Req() req: AuthRequest, @Param('documentId') id: string) { return this.documents.url(req.user!, parse(z.uuid(), id), true); }
  @Get(':id') get(@Req() req: AuthRequest, @Param('id') id: string) { return this.detail.get(req.user!, id); }
  @Get() list(@Req() req: AuthRequest, @Query() query: unknown) {
    return this.cases.list(req.user!, query);
  }
}
