import {ConflictException,ForbiddenException,Inject,Injectable,Body,Controller,Post,Req,Param,UseGuards} from '@nestjs/common';
import {z} from 'zod';
import {PrismaService} from '../prisma.service';
import {DocumentStorage} from '../documents/document-storage';
import {NoticePdfService} from './notice-pdf.service';
import {lockedNoticeCase,appendCaseEvent,writeNoticeFlowState} from './case-state-machine';
import {ensureNoticeLifecycle,requireNoticeRevision} from './notice-lifecycle';
import {AuthGuard,Roles,type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import type {CaseActor} from './case-access';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';

@Injectable()
export class NoticeSigning {
 constructor(private readonly prisma:PrismaService,private readonly storage:DocumentStorage,private readonly pdf:NoticePdfService,@Inject(NOTIFICATIONS)private readonly notifications:NotificationsPort){}
 async sign(actor:CaseActor,id:string,body:unknown){
  if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
  const b=parse(z.strictObject({revision:z.number().int().min(0),draft_id:z.uuid(),mode:z.enum(['uploaded','test']),profile_signature_id:z.uuid().optional(),confirmed:z.literal(true)}),body),db=await this.prisma.getClient();
  const source=await db.$transaction(async tx=>{const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,b.revision);
   if(c.status!=='approved'||!['notice_advocate_signature','notice_advocate_ready_to_submit','notice_admin_awaiting_test_esign'].includes(c.sub_status??'')||life.approved_draft_id!==b.draft_id)throw new ConflictException('Sign the current client-approved version before submitting to admin.');
   const profile=b.mode==='uploaded'?await tx.advocateSignature.findFirst({where:{id:b.profile_signature_id??'00000000-0000-0000-0000-000000000000',advocate_id:actor.id}}):null;
   if(b.mode==='uploaded'&&!profile)throw new ConflictException('Save and choose your own signature in your dashboard first.');
   const image=profile?await tx.document.findFirst({where:{id:profile.document_id,owner_id:actor.id,status:'uploaded',kind:'advocate_signature'}}):null;
   if(profile&&!image)throw new ConflictException('Your signature image is unavailable. Upload a new one.');return {profile,image};
  });
  const imageInfo=source.image?await this.storage.head(source.image.s3_key):null;
  if(source.image&&!imageInfo)throw new ConflictException('Your saved signature image is unavailable. Upload it again.');
  const at=new Date(),mark={mode:b.mode,at,...source.image?{bytes:await this.storage.read(source.image.s3_key,imageInfo!,2_000_000),mime:source.image.mime_type}:{}};
  const document=await this.pdf.signed(actor,id,b.draft_id,mark);
  try{return await db.$transaction(async tx=>{const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,b.revision);if(life.approved_draft_id!==b.draft_id||c.status!=='approved')throw new ConflictException('This draft changed while signing.');
   const signature=await tx.noticeSignature.create({data:{case_id:id,draft_id:b.draft_id,advocate_id:actor.id,document_id:document.id,profile_signature_id:source.profile?.id,mode:b.mode,signed_at:at}});
   await tx.noticeLifecycle.update({where:{case_id:id},data:{approved_document_id:document.id,test_esigned_at:b.mode==='test'?at:null,revision:{increment:1}}});
   const legacy=c.sub_status==='notice_admin_awaiting_test_esign';
   await writeNoticeFlowState(tx,actor,id,{status:'approved',sub_status:legacy?'notice_admin_ready_for_dispatch':'notice_advocate_ready_to_submit',notice_document_id:document.id},'notice_signed',{signature_id:signature.id,draft_id:b.draft_id,mode:b.mode,digital_signature_applied:false});
   return {signature_id:signature.id,document_id:document.id,mode:b.mode,signed_at:at,digital_signature_applied:false};
  });}catch(e){await this.pdf.discard(actor,document.id);throw e;}
 }
 async submit(actor:CaseActor,id:string,body:unknown){
  if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');const b=parse(z.strictObject({revision:z.number().int().min(0),draft_id:z.uuid(),signature_id:z.uuid()}),body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,b.revision);
   if(c.status!=='approved'||c.sub_status!=='notice_advocate_ready_to_submit'||life.approved_draft_id!==b.draft_id)throw new ConflictException('Sign the current approved notice before submitting.');
   const signature=await tx.noticeSignature.findFirst({where:{id:b.signature_id,case_id:id,draft_id:b.draft_id,advocate_id:actor.id,document_id:life.approved_document_id!}});if(!signature)throw new ConflictException('The signature no longer matches this approved PDF.');
   await tx.noticeLifecycle.update({where:{case_id:id},data:{handed_to_admin_at:life.handed_to_admin_at??new Date(),revision:{increment:1}}});
   await writeNoticeFlowState(tx,actor,id,{status:'approved',sub_status:life.address_checked_at?'notice_admin_notice_check':'notice_admin_address_check'},'notice_submitted_to_admin',{draft_id:b.draft_id,signature_id:signature.id});
   for(const admin of await tx.user.findMany({where:{role:'admin',status:'active'},select:{id:true}}))await this.notifications.send(tx,{user_id:admin.id,case_id:id,kind:'notice_review_needed',title:'Signed Legal Notice awaiting review',body:c.reference});
   await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'notice_submitted',title:'Your notice is with Legalitt',body:'Your advocate submitted the approved notice for final checks and dispatch. Case chat is now read-only.'});return {submitted:true};
  });
 }
}
@Controller('api/v1/notices') @UseGuards(AuthGuard) @Roles('advocate')
export class NoticeSigningController {
 constructor(private readonly signing:NoticeSigning){}
 @Post(':id/sign') sign(@Req() r:AuthRequest,@Param('id') id:string,@Body() b:unknown){return this.signing.sign(r.user!,parse(z.uuid(),id),b);}
 @Post(':id/submit-admin') submit(@Req() r:AuthRequest,@Param('id') id:string,@Body() b:unknown){return this.signing.submit(r.user!,parse(z.uuid(),id),b);}
}
