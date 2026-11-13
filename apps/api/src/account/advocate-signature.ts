import {BadRequestException,ConflictException,ForbiddenException,Injectable,Controller,Get,Post,Body,Req,UseGuards} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {PrismaService} from '../prisma.service';
import {DocumentStorage,stagingKey} from '../documents/document-storage';
import {FileInspector} from '../documents/file-inspector';
import {AuthGuard,Roles,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';

@Injectable()
export class AdvocateSignatures {
 constructor(private readonly prisma:PrismaService,private readonly storage:DocumentStorage,private readonly inspector:FileInspector){}
 private role(actor:CaseActor){if(actor.role!=='advocate')throw new ForbiddenException('Advocate account required');}
 async read(actor:CaseActor){this.role(actor);const db=await this.prisma.getClient(),signature=await db.advocateSignature.findFirst({where:{advocate_id:actor.id},orderBy:[{created_at:'desc'},{id:'desc'}]});if(!signature)return {signature:null};const doc=await db.document.findUniqueOrThrow({where:{id:signature.document_id}});return {signature:{id:signature.id,created_at:signature.created_at,url:await this.storage.download(doc.s3_key,'Signature.'+(doc.mime_type==='image/png'?'png':'jpg'),true)}};}
 async presign(actor:CaseActor,body:unknown){this.role(actor);const {mime}=parse(z.strictObject({mime:z.enum(['image/png','image/jpeg'])}),body),db=await this.prisma.getClient(),id=randomUUID(),filename='Signature.'+(mime==='image/png'?'png':'jpg'),key=`advocate-signatures/${actor.id}/${id}/${filename}`;
  const doc=await db.document.create({data:{id,owner_id:actor.id,case_id:null,kind:'advocate_signature',filename,mime_type:mime,s3_key:key,status:'pending',size_bytes:0}});
  return {document:{id:doc.id,filename,mime_type:mime},upload:await this.storage.upload(key,mime,2_000_000)};
 }
 async complete(actor:CaseActor,body:unknown){this.role(actor);const b=parse(z.strictObject({document_id:z.uuid(),base_signature_id:z.uuid().nullable()}),body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`signature:${actor.id}`}))`;const prior=await tx.advocateSignature.findFirst({where:{advocate_id:actor.id},orderBy:[{created_at:'desc'},{id:'desc'}]});if((prior?.id??null)!==b.base_signature_id)throw new ConflictException('Your saved signature changed. Reload before replacing it.');
   const doc=await tx.document.findFirst({where:{id:b.document_id,owner_id:actor.id,case_id:null,kind:'advocate_signature',status:'pending'}});if(!doc)throw new BadRequestException('Choose a pending signature upload from your own account.');
   const head=await this.storage.head(stagingKey(doc.s3_key));if(!head||head.size>2_000_000)throw new BadRequestException('Upload a PNG or JPEG signature up to 2 MB.');const bytes=await this.storage.read(stagingKey(doc.s3_key),head,2_000_000),inspection=await this.inspector.inspect(bytes);if(inspection.mime!==doc.mime_type||!['image/png','image/jpeg'].includes(inspection.mime))throw new BadRequestException('The uploaded file must be a valid PNG or JPEG image.');
   await this.storage.promote(doc.s3_key,head,doc.mime_type);await tx.document.update({where:{id:doc.id},data:{status:'uploaded',size_bytes:head.size,page_count:1}});const signature=await tx.advocateSignature.create({data:{advocate_id:actor.id,document_id:doc.id}});return {id:signature.id,created_at:signature.created_at};
  },{timeout:30000});
 }
}
@Controller('api/v1/account/signature') @UseGuards(AuthGuard) @Roles('advocate')
export class AdvocateSignatureController {
 constructor(private readonly signatures:AdvocateSignatures){}
 @Get() read(@Req() r:AuthRequest){return this.signatures.read(r.user!);}
 @Post('upload') upload(@Req() r:AuthRequest,@Body() b:unknown){return this.signatures.presign(r.user!,b);}
 @Post('complete') complete(@Req() r:AuthRequest,@Body() b:unknown){return this.signatures.complete(r.user!,b);}
}
