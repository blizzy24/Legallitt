import {Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {WalletService} from './wallet.service';

const json = async (p: Promise<unknown>) => JSON.parse(JSON.stringify(await p, (_, v) => typeof v === 'bigint' ? v.toString() : v));
const id = (v: string) => parse(z.uuid(), v);

/** D-36, D-42. Advocate routes act on the signed-in advocate only; admin routes are role-checked in the service. */
@Controller('api/v1') @UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}
  @Get('advocate/wallet') get(@Req() r: AuthRequest, @Query() q: unknown) {return json(this.wallet.wallet(r.user!, q));}
  @Get('advocate/bank-account') bank(@Req() r: AuthRequest) {return json(this.wallet.bank(r.user!));}
  @Put('advocate/bank-account') saveBank(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.wallet.saveBank(r.user!, b));}
  @Post('advocate/payout-requests') request(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.wallet.requestPayout(r.user!, b));}
  @Get('advocate/payout-requests/:id') one(@Req() r: AuthRequest, @Param('id') v: string) {return json(this.wallet.payoutRequest(r.user!, id(v)));}
  @Get('admin/payouts') list(@Req() r: AuthRequest, @Query() q: unknown) {return json(this.wallet.adminList(r.user!, q));}
  @Post('admin/payouts/:id/paid') paid(@Req() r: AuthRequest, @Param('id') v: string, @Body() b: unknown) {return json(this.wallet.markPaid(r.user!, id(v), b));}
}
