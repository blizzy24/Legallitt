import {Body,Controller,Get,Param,Patch,Post,Req,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {FirService} from './fir.service';
const id = (value:string) => parse(z.uuid(),value);
const json = async (p:Promise<unknown>) => JSON.parse(JSON.stringify(await p,(_,v)=>typeof v==='bigint'?v.toString():v));
@Controller('api/v1/fir') @UseGuards(AuthGuard)
export class FirController {
  constructor(private readonly fir: FirService) {}
  @Get(':id/draft-context') context(@Req() req:AuthRequest,@Param('id') value:string){return json(this.fir.context(req.user!,id(value)));}
  @Patch(':id/intake') intake(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown) {return json(this.fir.intake(req.user!,id(value),body));}
  @Post(':id/drafts') save(@Req() req:AuthRequest,@Param('id') value:string,@Body() body:unknown) {return json(this.fir.save(req.user!,id(value),body));}
  @Post(':id/drafts/:draftId/pdf') preview(@Req() req:AuthRequest,@Param('id') value:string,@Param('draftId') draftId:string,@Body() body:unknown){parse(z.strictObject({}),body??{});return json(this.fir.preview(req.user!,id(value),id(draftId)));}
  @Post(':id/drafts/:draftId/send') send(@Req() req:AuthRequest,@Param('id') value:string,@Param('draftId') draftId:string,@Body() body:unknown) {
    parse(z.strictObject({}),body??{});return json(this.fir.send(req.user!,id(value),id(draftId)));
  }
  @Post(':id/drafts/:draftId/approve') approve(@Req() req:AuthRequest,@Param('id') value:string,@Param('draftId') draftId:string,@Body() body:unknown) {
    parse(z.strictObject({}),body??{});return json(this.fir.approve(req.user!,id(value),id(draftId)));
  }
}
