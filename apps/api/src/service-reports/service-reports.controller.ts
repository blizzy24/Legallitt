import {Body, Controller, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {ServiceReportsService} from './service-reports.service';

const id = (value: string) => parse(z.uuid(), value);
const empty = (body: unknown) => parse(z.strictObject({}), body ?? {});
const json = async (p: Promise<unknown>) => JSON.parse(JSON.stringify(await p, (_, v) => typeof v === 'bigint' ? v.toString() : v));

@Controller('api/v1/service-reports') @UseGuards(AuthGuard)
export class ServiceReportsController {
  constructor(private readonly reports: ServiceReportsService) {}
  @Get('pricing/:code') pricing(@Param('code') code: string) {return json(this.reports.pricing(code));}
  @Patch(':id/intake') intake(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {return json(this.reports.intake(req.user!, id(v), body));}
  @Post(':id/start') start(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {empty(body); return json(this.reports.start(req.user!, id(v)));}
  @Post(':id/drafts') save(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {return json(this.reports.save(req.user!, id(v), body));}
  @Post(':id/drafts/:draftId/preview') preview(@Req() req: AuthRequest, @Param('id') v: string, @Param('draftId') d: string, @Body() body: unknown) {
    empty(body); return json(this.reports.preview(req.user!, id(v), id(d)));
  }
  @Post(':id/drafts/:draftId/submit') submit(@Req() req: AuthRequest, @Param('id') v: string, @Param('draftId') d: string, @Body() body: unknown) {
    empty(body); return json(this.reports.submit(req.user!, id(v), id(d)));
  }
  @Post(':id/drafts/:draftId/approve') approve(@Req() req: AuthRequest, @Param('id') v: string, @Param('draftId') d: string, @Body() body: unknown) {
    empty(body); return json(this.reports.approve(req.user!, id(v), id(d)));
  }
  @Post(':id/drafts/:draftId/request-changes') changes(@Req() req: AuthRequest, @Param('id') v: string, @Param('draftId') d: string, @Body() body: unknown) {
    return json(this.reports.requestChanges(req.user!, id(v), id(d), body));
  }
}
