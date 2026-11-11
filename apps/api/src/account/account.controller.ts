import {Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards} from '@nestjs/common';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {AccountService} from './account.service';

const json = async (p: Promise<unknown>) => JSON.parse(JSON.stringify(await p, (_, v) => typeof v === 'bigint' ? v.toString() : v));

/** D-20–D-24, D-27. Every route acts on the signed-in user only; no id in a path names another user. */
@Controller('api/v1/account') @UseGuards(AuthGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}
  @Get('preferences') preferences(@Req() r: AuthRequest) {return json(this.account.preferences(r.user!));}
  @Patch('preferences') update(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.account.updatePreferences(r.user!, b));}
  @Get('security') security(@Req() r: AuthRequest) {return json(this.account.security(r.user!));}
  @Post('password') password(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.account.changePassword(r.user!, b));}
  @Post('sign-out-everywhere') signOut(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.account.signOutEverywhere(r.user!, b));}
  @Get('export') exportData(@Req() r: AuthRequest) {return json(this.account.exportData(r.user!));}
  @Get('deletion') deletion(@Req() r: AuthRequest) {return json(this.account.deletionState(r.user!));}
  @Post('deletion') requestDeletion(@Req() r: AuthRequest, @Body() b: unknown) {return json(this.account.requestDeletion(r.user!, b));}
  @Get('saved-advocates') saved(@Req() r: AuthRequest) {return json(this.account.savedAdvocates(r.user!));}
  @Put('saved-advocates/:id') save(@Req() r: AuthRequest, @Param('id') id: string) {return json(this.account.saveAdvocate(r.user!, id));}
  @Delete('saved-advocates/:id') unsave(@Req() r: AuthRequest, @Param('id') id: string) {return json(this.account.unsaveAdvocate(r.user!, id));}
}
