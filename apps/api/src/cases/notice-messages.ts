import {BadRequestException,Body,Controller,Get,Injectable,NotFoundException,Param,Post,Query,Req,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {NoticeCommentSchema} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {AuthGuard,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {caseScope,type CaseActor} from './case-access';
import {lockedCase} from './case-state-machine';
import {isConsultationService} from '@legalitt/shared';
const input=z.strictObject({body:NoticeCommentSchema.shape.comment.optional(),document_id:z.uuid().optional()}).refine(v=>v.body||v.document_id,'Enter a message or attach a document');
@Injectable()
export class NoticeMessages {
 constructor(private readonly prisma:PrismaService){}
 async thread(actor:CaseActor,caseId:string){
  const db=await this.prisma.getClient();
  return db.$transaction(async tx=>{
   await lockedCase(tx,actor,caseId);
   return await tx.messageThread.findFirst({where:{case_id:caseId,kind:'client_advocate'}})??tx.messageThread.create({data:{case_id:caseId,kind:'client_advocate'}});
  });
 }
 private async accessible(actor:CaseActor,id:string){
  const db=await this.prisma.getClient();
  const thread=await db.messageThread.findFirst({where:{id,kind:'client_advocate',case_id_relation:{is:caseScope(actor)}}});
  if(!thread)throw new NotFoundException('Thread not found');
  return {db,thread};
 }
 async list(actor:CaseActor,id:string,after?:string){
  const {db}=await this.accessible(actor,id);
  const cursor=after?await db.message.findFirst({where:{id:parse(z.uuid(),after),thread_id:id}}):null;
  if(after&&!cursor)throw new BadRequestException('Invalid message cursor');
  const items=await db.message.findMany({where:{thread_id:id,thread_id_relation:{is:{case_id_relation:{is:caseScope(actor)}}},...(cursor?{OR:[{created_at:{gt:cursor.created_at}},{created_at:cursor.created_at,id:{gt:cursor.id}}]}:{})},orderBy:[{created_at:'asc'},{id:'asc'}],take:100});
  return {items,next_cursor:items.length===100?items.at(-1)!.id:null};
 }
 async send(actor:CaseActor,id:string,body:unknown){
  const value=parse(input,body),{db,thread}=await this.accessible(actor,id);
  return db.$transaction(async tx=>{
   // Recheck membership under the case lock; assignment may change between calls.
   const record=await lockedCase(tx,actor,thread.case_id!);
   if(value.document_id&&!await tx.document.findFirst({where:{id:value.document_id,case_id:thread.case_id,status:'uploaded'}}))throw new BadRequestException('Attach an uploaded document from this case');
   if(value.document_id&&isConsultationService(record.service_code)){
    const doc=await tx.document.findUniqueOrThrow({where:{id:value.document_id}});
    if(doc.kind==='consultation_report'&&!await tx.consultationReport.findFirst({where:{case_id:record.id,document_id:doc.id,status:'approved'}}))throw new BadRequestException('A report must be approved by admin before it can be shared with the client.');
   }
   return tx.message.create({data:{thread_id:id,sender_id:actor.id,body:value.body??null,document_id:value.document_id??null}});
  });
 }
 async read(actor:CaseActor,id:string){
  const {db,thread}=await this.accessible(actor,id);
  return db.$transaction(async tx=>{
   await lockedCase(tx,actor,thread.case_id!);
   await tx.message.updateMany({where:{thread_id:id,sender_id:{not:actor.id},read_at:null},data:{read_at:new Date()}});
   return {read:true};
  });
 }
}
@Controller('api/v1')
@UseGuards(AuthGuard)
export class NoticeMessagesController {
 constructor(private readonly messages:NoticeMessages){}
 @Get('cases/:id/thread') thread(@Req() req:AuthRequest,@Param('id') id:string){return this.messages.thread(req.user!,parse(z.uuid(),id));}
 @Get('threads/:id/messages') list(@Req() req:AuthRequest,@Param('id') id:string,@Query('after') after?:string){return this.messages.list(req.user!,parse(z.uuid(),id),after);}
 @Post('threads/:id/messages') send(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown){return this.messages.send(req.user!,parse(z.uuid(),id),body);}
 @Post('threads/:id/read') read(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown){parse(z.strictObject({}),body??{});return this.messages.read(req.user!,parse(z.uuid(),id));}
}
