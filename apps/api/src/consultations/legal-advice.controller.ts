import {Body,Controller,Get,Param,Post,Query,Req,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {LegalAdviceWorkflow} from './legal-advice.service';
import {LegalAdvicePayments} from './legal-advice-payments';
import {LegalAdviceWritten} from './legal-advice-written';
const json=async(p:Promise<unknown>)=>JSON.parse(JSON.stringify(await p,(_,v)=>typeof v==='bigint'?v.toString():v));
const id=(s:string)=>parse(z.uuid(),s);
@Controller('api/v1/legal-advice') @UseGuards(AuthGuard)
export class LegalAdviceController {
 constructor(private readonly flow:LegalAdviceWorkflow,private readonly payments:LegalAdvicePayments,private readonly written:LegalAdviceWritten){}
 @Get('advocates') advocates(@Req() r:AuthRequest,@Query('mode') mode:unknown){return json(this.flow.advocates(r.user!,mode));}
 @Get() list(@Req() r:AuthRequest){return json(this.flow.list(r.user!));}
 @Post() create(@Req() r:AuthRequest,@Body() b:unknown){return json(this.flow.create(r.user!,b));}
 @Get(':id') read(@Req() r:AuthRequest,@Param('id') v:string){return json(this.flow.read(r.user!,id(v)));}
 @Get(':id/candidates') candidates(@Req() r:AuthRequest,@Param('id') v:string){return json(this.flow.candidates(r.user!,id(v)));}
 @Post(':id/actions/:action') action(@Req() r:AuthRequest,@Param('id') v:string,@Param('action') action:string,@Body() b:unknown){return json(this.flow.action(r.user!,id(v),action,b));}
 @Post(':id/quote') quote(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.payments.quote(r.user!,id(v),b));}
 @Post(':id/pay') pay(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.payments.pay(r.user!,id(v),b));}
 @Post(':id/ai') ai(@Req() r:AuthRequest,@Param('id') v:string){return json(this.flow.generateAi(r.user!,id(v)));}
 @Post(':id/written') saveWritten(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.written.save(r.user!,id(v),b));}
 @Post(':id/written/deliver') deliverWritten(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.written.deliver(r.user!,id(v),b));}
}
