import {Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {AdvocateVerificationService} from './advocate-verification.service';

const id = (v: string) => parse(z.uuid(), v);
const empty = (b: unknown) => parse(z.strictObject({}), b ?? {});
const json = async (p: Promise<unknown>) => JSON.parse(JSON.stringify(await p, (_, v) => typeof v === 'bigint' ? v.toString() : v));

/** D-35 / D-42. Advocate routes act on the signed-in advocate only; admin routes require the admin role. */
@Controller('api/v1') @UseGuards(AuthGuard)
export class AdvocateVerificationController {
  constructor(private readonly v: AdvocateVerificationService) {}
  @Get('advocate/verification') read(@Req() r: AuthRequest) {return json(this.v.read(r.user!));}
  @Patch('advocate/verification') save(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.v.save(r.user!, b));}
  @Post('advocate/verification/submit') submit(@Req() r: AuthRequest, @Body() b: unknown) {empty(b); return json(this.v.submit(r.user!));}
  @Post('advocate/verification/documents/presign') presign(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.v.presign(r.user!, b));}
  @Post('advocate/verification/documents/:id/complete') complete(@Req() r: AuthRequest, @Param('id') d: string, @Body() b: unknown) {empty(b); return json(this.v.complete(r.user!, id(d)));}
  @Delete('advocate/verification/documents/:id') remove(@Req() r: AuthRequest, @Param('id') d: string) {return json(this.v.remove(r.user!, id(d)));}
  @Get('advocate/verification/documents/:id/url') url(@Req() r: AuthRequest, @Param('id') d: string) {
    if (r.user!.role !== 'advocate') return Promise.reject(new NotFoundException('Document not found'));
    return json(this.v.url(r.user!, id(d)));
  }
  @Get('admin/advocate-approvals') queue(@Req() r: AuthRequest, @Query('status') s?: string) {return json(this.v.queue(r.user!, s ?? 'waiting'));}
  @Get('admin/advocate-approvals/documents/:id/url') adminUrl(@Req() r: AuthRequest, @Param('id') d: string) {
    if (r.user!.role !== 'admin') return Promise.reject(new ForbiddenException('Admin access required'));
    return json(this.v.url(r.user!, id(d)));
  }
  @Get('admin/advocate-approvals/:id') detail(@Req() r: AuthRequest, @Param('id') u: string) {return json(this.v.detail(r.user!, id(u)));}
  @Post('admin/advocate-approvals/:id/decide') decide(@Req() r: AuthRequest, @Param('id') u: string, @Body() b: unknown) {return json(this.v.decide(r.user!, id(u), b));}
}
