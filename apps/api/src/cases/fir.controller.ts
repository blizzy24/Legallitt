import {FirAdminService} from './fir-admin.service';
import {Body,Controller,Get,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {FirService} from './fir.service';
import {FirFlowService} from './fir-flow.service';
const id = (value:string) => parse(z.uuid(),value);
const json = async (p:Promise<unknown>) => JSON.parse(JSON.stringify(await p,(_,v)=>typeof v==='bigint'?v.toString():v));
@Controller('api/v1/fir') @UseGuards(AuthGuard)
export class FirController {
  constructor(private readonly fir: FirService,private readonly review: FirAdminService,private readonly flow: FirFlowService) {}
  // docs/flows/FIR-DRAFT-FLOW.md: one role-shaped view, the C10 stage, and the new actions.
  // Read-only: the promised turnaround, which C2 "Why FIR" shows before any case exists.
  // There is no police-submission step or switch (Q119, Q120): PATCH /fir/settings and
  // POST /fir/:id/police-submission are gone. PATCH, not PUT, below: the API's
  // cross-origin policy allows GET, POST, PATCH and DELETE only.
  @Get('settings') settings(){return this.flow.settings();}
  @Get(':id/flow') view(@Req() req:AuthRequest,@Param('id') value:string){return json(this.flow.view(req.user!,id(value)));}
  @Post(':id/client-approve') clientApprove(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return json(this.flow.clientApprove(req.user!,id(value),body));}
  @Post(':id/client-changes') clientChanges(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return json(this.flow.clientChanges(req.user!,id(value),body));}
  @Post(':id/reject') advocateReject(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return json(this.flow.advocateReject(req.user!,id(value),body));}
  @Post(':id/remind-client') remind(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){parse(z.strictObject({}),body??{});return json(this.flow.remindClient(req.user!,id(value)));}
  @Get(':id/lifecycle') lifecycle(@Req() req:AuthRequest,@Param('id') value:string){return json(this.review.read(req.user!,id(value)));}
  @Post(':id/return') reject(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return json(this.review.reject(req.user!,id(value),body));}
  @Post(':id/reassign') reassign(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return json(this.review.reassign(req.user!,id(value),body));}
  @Post(':id/identity-review') identity(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return json(this.review.identityReview(req.user!,id(value),body));}
  @Post(':id/identity-replacement') replacement(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown){return json(this.review.replaceIdentity(req.user!,id(value),body));}
  @Get(':id/draft-context') context(@Req() req:AuthRequest,@Param('id') value:string){return json(this.fir.context(req.user!,id(value)));}
  @Patch(':id/intake') intake(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown) {return json(this.fir.intake(req.user!,id(value),body));}
  @Post(':id/drafts') save(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown) {return json(this.fir.save(req.user!,id(value),body));}
  @Post(':id/drafts/:draftId/pdf') preview(@Req() req:AuthRequest,@Param('id') value:string,@Param('draftId') draftId:string,@Body() body:unknown){parse(z.strictObject({}),body??{});return json(this.fir.preview(req.user!,id(value),id(draftId)));}
  @Post(':id/drafts/:draftId/send') send(@Req() req:AuthRequest,@Param('id') value:string,@Param('draftId') draftId:string,@Body() body:unknown) {
    parse(z.strictObject({}),body??{});return json(this.fir.send(req.user!,id(value),id(draftId)));
  }
  @Post(':id/drafts/:draftId/approve') approve(@Req() req:AuthRequest,@Param('id') value:string,@Param('draftId') draftId:string,@Body() body:unknown) {
    return json(this.fir.approve(req.user!,id(value),id(draftId),body));
  }
}
