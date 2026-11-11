import {Body, Controller, Get, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, Roles, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {SupportService} from './support.service';

const id = (value: string) => parse(z.uuid(), value);
const empty = (body: unknown) => parse(z.strictObject({}), body ?? {});

@Controller('api/v1') @UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly support: SupportService) {}
  @Get('messages/inbox') inbox(@Req() req: AuthRequest, @Query() query: unknown) {return this.support.inbox(req.user!, query);}
  @Post('support/tickets') create(@Req() req: AuthRequest, @Body() body: unknown) {return this.support.createTicket(req.user!, body);}
  @Get('support/tickets') mine(@Req() req: AuthRequest) {return this.support.mine(req.user!);}
  @Get('support/tickets/:id') one(@Req() req: AuthRequest, @Param('id') v: string) {return this.support.one(req.user!, id(v));}
  @Post('support/tickets/:id/messages') reply(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {return this.support.reply(req.user!, id(v), body);}
  @Post('support/tickets/:id/read') read(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {empty(body); return this.support.markRead(req.user!, id(v));}
  @Post('support/callbacks') callback(@Req() req: AuthRequest, @Body() body: unknown) {return this.support.requestCallback(req.user!, body);}
  @Get('support/chat') currentChat(@Req() req: AuthRequest) {return this.support.currentChat(req.user!).then(chat => ({chat}));}
  @Post('support/chat') chat(@Req() req: AuthRequest, @Body() body: unknown) {return this.support.chat(req.user!, body);}
  @Get('admin/support') @Roles('admin') adminList(@Req() req: AuthRequest, @Query() query: unknown) {return this.support.adminList(req.user!, query);}
  @Get('admin/support/:id') @Roles('admin') adminOne(@Req() req: AuthRequest, @Param('id') v: string) {return this.support.adminOne(req.user!, id(v));}
  @Post('admin/support/:id/messages') @Roles('admin') adminReply(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {return this.support.adminReply(req.user!, id(v), body);}
  @Post('admin/support/:id/close') @Roles('admin') adminClose(@Req() req: AuthRequest, @Param('id') v: string, @Body() body: unknown) {empty(body); return this.support.adminClose(req.user!, id(v));}
}
