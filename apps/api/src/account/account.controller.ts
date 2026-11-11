import {Body, Controller, Get, Param, Patch, Query, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {AccountService} from './account.service';

const json = async (p: Promise<unknown>) => JSON.parse(JSON.stringify(await p, (_, v) => typeof v === 'bigint' ? v.toString() : v));
const id = (v: string) => parse(z.uuid(), v);

// D-15, D-17, D-18, D-19 — the signed-in client's own account data only.
@Controller('api/v1/account') @UseGuards(AuthGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}
  @Get('profile') profile(@Req() req: AuthRequest) {return json(this.account.profile(req.user!));}
  @Patch('profile') update(@Req() req: AuthRequest, @Body() body: unknown) {return json(this.account.updateProfile(req.user!, body));}
  @Get('documents') documents(@Req() req: AuthRequest, @Query('case_id') caseId?: string) {return json(this.account.documents(req.user!, caseId ? id(caseId) : undefined));}
  @Get('payments') payments(@Req() req: AuthRequest) {return json(this.account.payments(req.user!));}
  @Get('payments/:id') payment(@Req() req: AuthRequest, @Param('id') v: string) {return json(this.account.payment(req.user!, id(v)));}
  @Get('payments/:id/receipt') receipt(@Req() req: AuthRequest, @Param('id') v: string) {return json(this.account.receipt(req.user!, id(v)));}
}
