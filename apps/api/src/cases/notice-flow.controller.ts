import {Body, Controller, Get, Param, Post, Put, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, Roles, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {NoticeFlowService} from './notice-flow.service';
const id = (value: string) => parse(z.uuid(), value);
@Controller('api/v1/notices')
@UseGuards(AuthGuard)
export class NoticeFlowController {
  constructor(private readonly flow: NoticeFlowService) {}
  @Get(':id/flow') view(@Req() req: AuthRequest, @Param('id') value: string) {return this.flow.view(req.user!, id(value));}
  @Put(':id/filing') @Roles('client') filing(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.filing(req.user!, id(value), body);}
  @Post(':id/address-check') @Roles('admin') address(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.check(req.user!, id(value), 'address', body);}
  @Post(':id/notice-check') @Roles('admin') notice(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.check(req.user!, id(value), 'notice', body);}
  @Post(':id/return') @Roles('admin') returned(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.returnDraft(req.user!, id(value), body);}
  @Post(':id/test-esign') @Roles('advocate') esign(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.testEsign(req.user!, id(value), body);}
  @Post(':id/dispatch') @Roles('admin') dispatch(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.dispatch(req.user!, id(value), body);}
  @Post(':id/tracking') @Roles('admin') tracking(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.tracking(req.user!, id(value), body);}
  @Post(':id/delivery-result') @Roles('admin') result(@Req() req: AuthRequest, @Param('id') value: string, @Body() body: unknown) {return this.flow.result(req.user!, id(value), body);}
  @Post(':id/tasks') @Roles('admin','advocate') task(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return this.flow.requestTask(req.user!,id(value),body);}
  @Post(':id/tasks/reply') @Roles('client') replyTask(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return this.flow.replyTask(req.user!,id(value),body);}
  @Post(':id/tasks/resolve') @Roles('admin') resolveTask(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return this.flow.resolveTask(req.user!,id(value),body);}
  @Post(':id/deadline') @Roles('admin') deadline(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return this.flow.extendDeadline(req.user!,id(value),body);}
  @Post(':id/partial-refund') @Roles('admin') partialRefund(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return this.flow.partialRefund(req.user!,id(value),body);}
  @Post(':id/reassign') @Roles('admin') reassign(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return this.flow.reassign(req.user!,id(value),body);}
  @Post(':id/reply-received') @Roles('client','admin') replyReceived(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return this.flow.replyReceived(req.user!,id(value),body);}
}
