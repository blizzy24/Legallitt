import {BadRequestException,ConflictException,ForbiddenException,Injectable,Body,Controller,Get,Param,Post,Req,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {isFlowReportService} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {AuthGuard,Roles,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {activeAt,newest} from '../payments/price-quotes';
const input=z.strictObject({tier:z.enum(['ordinary','urgent']),base_pricing_id:z.uuid(),base_amount_paise:z.string().regex(/^[1-9]\d{0,11}$/),reason:z.string().trim().min(1).max(600)});
@Injectable()
export class ReportTariffs {
 constructor(private readonly prisma:PrismaService){}
 private check(actor:CaseActor,code:string){if(actor.role!=='admin')throw new ForbiddenException('Admin access required');if(!isFlowReportService(code))throw new BadRequestException('This tariff editor covers Property Search and Document Forensic.');}
 async read(actor:CaseActor,code:string){this.check(actor,code);const db=await this.prisma.getClient();return db.servicePricing.findMany({where:{service_code:code,variant:null,fee_policy_id:{not:null}},orderBy:[{confirmed:'desc'},...newest]});}
 async save(actor:CaseActor,code:string,body:unknown){this.check(actor,code);const b=parse(input,body),db=await this.prisma.getClient();return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(731109001)::text`;
  const now=new Date(),prior=await tx.servicePricing.findFirst({where:{service_code:code,tier:b.tier,variant:null,fee_policy_id:{not:null},...activeAt(now)},orderBy:[{confirmed:'desc'},...newest]});
  if(prior?.id!==b.base_pricing_id)throw new ConflictException('This tariff changed. Reload the current price before saving.');
  const policy=await tx.feePolicy.findUniqueOrThrow({where:{id:prior.fee_policy_id!}});
  if(!policy.confirmed)throw new ConflictException('Activate the confirmed tariff seed before editing prices.');
  const row=await tx.servicePricing.create({data:{service_code:code,tier:b.tier,variant:null,base_amount_paise:BigInt(b.base_amount_paise),gst_bps:prior.gst_bps,confirmed:true,fee_policy_id:prior.fee_policy_id,source_note:b.reason,effective_from:now}});
  await tx.adminAction.create({data:{admin_id:actor.id,action:'report_tariff_updated',subject_type:'service_pricing',subject_id:row.id,payload:{previous_id:prior.id,service_code:code,tier:b.tier,base_amount_paise:b.base_amount_paise,reason:b.reason}}});return row;
 });}
}
const json=async(p:Promise<unknown>)=>JSON.parse(JSON.stringify(await p,(_,v)=>typeof v==='bigint'?v.toString():v));
@Controller('api/v1/admin/report-tariffs') @UseGuards(AuthGuard) @Roles('admin')
export class ReportTariffsController {
 constructor(private readonly tariffs:ReportTariffs){}
 @Get(':code') read(@Req() req:AuthRequest,@Param('code') code:string){return json(this.tariffs.read(req.user!,code));}
 @Post(':code') save(@Req() req:AuthRequest,@Param('code') code:string,@Body() body:unknown){return json(this.tariffs.save(req.user!,code,body));}
}
