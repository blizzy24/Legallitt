import {ConflictException,ForbiddenException,Injectable} from '@nestjs/common';
import {LegalAdviceConfigSchema,legalAdviceRequestedSlots} from '@legalitt/shared';
import {z} from 'zod';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {PrismaService} from '../prisma.service';

@Injectable()
export class LegalAdviceSettings {
 constructor(private readonly prisma:PrismaService){}
 async slots(actor:CaseActor,date:unknown){
  if(actor.role!=='client')throw new ForbiddenException('Client action required');
  const day=parse(z.iso.date(),date),{config,version}=await this.read();
  return {items:legalAdviceRequestedSlots(day,config,Date.now()).map(scheduled_at=>({scheduled_at})),timezone:config.timezone,version,requested_only:true};
 }
 async read(){
  const db=await this.prisma.getClient(),row=await db.legalAdvicePolicy.findFirst({where:{effective_from:{lte:new Date()}},orderBy:{version:'desc'}});
  if(!row)throw new ConflictException('Legal Advice booking is not configured yet. Please contact support.');
  return {id:row.id,version:row.version,config:LegalAdviceConfigSchema.parse(row.config)};
 }
 async save(actor:CaseActor,body:unknown){
  if(actor.role!=='admin')throw new ForbiddenException('Admin action required');
  const input=parse(z.strictObject({expected_version:z.number().int().positive(),config:LegalAdviceConfigSchema,reason:z.string().trim().min(3).max(1000)}),body);
  const db=await this.prisma.getClient();
  return db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT pg_advisory_xact_lock(731114002)::text`;
   const old=await tx.legalAdvicePolicy.findFirst({orderBy:{version:'desc'}});
   if(!old||old.version!==input.expected_version)throw new ConflictException('Settings changed. Reload the current settings before saving.');
   if(input.config.version!==old.version+1)throw new ConflictException('The next configuration version is required.');
   return tx.legalAdvicePolicy.create({data:{version:old.version+1,config:input.config,reason:input.reason,created_by:actor.id}});
  });
 }
}
