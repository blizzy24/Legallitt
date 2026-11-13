import {Body,Controller,Get,Post,Req,UseGuards,Injectable,ForbiddenException,ConflictException} from '@nestjs/common';
import {z} from 'zod';
import {SupportPolicySchema} from '@legalitt/shared';
import {AuthGuard,Roles,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {PrismaService} from '../prisma.service';
import type {CaseActor} from '../cases/case-access';

@Injectable()
export class SupportSettings {
 constructor(private readonly prisma:PrismaService){}
 async read(){const db=await this.prisma.getClient();const row=await db.supportPolicy.findFirst({where:{effective_from:{lte:new Date()}},orderBy:{version:'desc'}});if(!row)throw new ConflictException('Support hours are unavailable. Please retry.');return {...row,config:SupportPolicySchema.parse(row.config)};}
 async save(actor:CaseActor,body:unknown){
  if(actor.role!=='admin')throw new ForbiddenException('Admin access required');
  const b=parse(z.strictObject({base_version:z.number().int().positive(),config:SupportPolicySchema}),body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('support-policy'))::text`;const prior=await tx.supportPolicy.findFirst({orderBy:{version:'desc'}});if(prior?.version!==b.base_version)throw new ConflictException('Support settings changed. Retry before saving.');
   const row=await tx.supportPolicy.create({data:{version:prior.version+1,config:b.config,created_by:actor.id,source_note:'Admin support settings update'}});
   await tx.adminAction.create({data:{admin_id:actor.id,action:'support_policy_updated',subject_type:'support_policy',subject_id:row.id,payload:{version:row.version}}});return row;
  });
 }
}
@Controller('api/v1/support/settings') @UseGuards(AuthGuard)
export class SupportSettingsController {
 constructor(private readonly settings:SupportSettings){}
 @Get() read(){return this.settings.read();}
 @Post() @Roles('admin') save(@Req() req:AuthRequest,@Body() body:unknown){return this.settings.save(req.user!,body);}
}
