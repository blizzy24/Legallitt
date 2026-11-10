import {Body,Controller,Get,Headers,Param,Patch,Post,Query,Req,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {AuthGuard,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {ConsultationService} from './consultation.service';
import {ConsultationPayments} from './consultation-payments';
import {ConsultationReports} from './consultation-reports';
const id=(v:string)=>parse(z.uuid(),v);
const json=async(p:Promise<unknown>)=>JSON.parse(JSON.stringify(await p,(_,v)=>typeof v==='bigint'?v.toString():v));
@Controller('api/v1/consultations') @UseGuards(AuthGuard)
export class ConsultationController {
  constructor(private readonly service:ConsultationService,private readonly payments:ConsultationPayments,private readonly reports:ConsultationReports){}
  @Get('availability') availability(@Req() r:AuthRequest){return json(this.service.availability(r.user!));}
  @Post('availability') saveAvailability(@Req() r:AuthRequest,@Body() b:unknown){return json(this.service.availability(r.user!,b));}
  @Get('advocates') advocates(@Req() r:AuthRequest,@Query() q:unknown){return json(this.service.advocates(r.user!,q));}
  @Get('advocates/:advocateId/slots') slots(@Req() r:AuthRequest,@Param('advocateId') a:string,@Query() q:unknown){return json(this.service.slots(r.user!,id(a),q));}
  @Get(':id') read(@Req() r:AuthRequest,@Param('id') v:string){return json(this.service.read(r.user!,id(v)));}
  @Patch(':id/intake') intake(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.service.intake(r.user!,id(v),b));}
  @Post(':id/reserve') reserve(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.service.reserve(r.user!,id(v),b));}
  @Post(':id/submit') submit(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){parse(z.strictObject({}),b??{});return json(this.service.submit(r.user!,id(v)));}
  @Post(':id/reschedule') reschedule(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.service.reschedule(r.user!,id(v),b));}
  @Post(':id/session/:action') session(@Req() r:AuthRequest,@Param('id') v:string,@Param('action') a:string,@Body() b:unknown){return json(this.service.sessionAction(r.user!,id(v),parse(z.enum(['join','start','end']),a),b));}
  @Post(':id/quotes') offer(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.payments.offer(r.user!,id(v),b));}
  @Post(':id/payment-quote') quote(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.payments.quote(r.user!,id(v),b));}
  @Post(':id/pay') pay(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown,@Headers('idempotency-key') k:unknown){return json(this.payments.pay(r.user!,id(v),b,k));}
  @Patch(':id/notes') notes(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.reports.notes(r.user!,id(v),b));}
  @Post(':id/reports') save(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.reports.save(r.user!,id(v),b));}
  @Post(':id/reports/:reportId/submit') send(@Req() r:AuthRequest,@Param('id') v:string,@Param('reportId') p:string,@Body() b:unknown){return json(this.reports.submit(r.user!,id(v),id(p),b));}
  @Post(':id/reports/review') review(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.reports.review(r.user!,id(v),b));}
  @Post(':id/progress') progress(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.reports.progress(r.user!,id(v),b));}
  @Post(':id/rating') rate(@Req() r:AuthRequest,@Param('id') v:string,@Body() b:unknown){return json(this.reports.rate(r.user!,id(v),b));}
}
