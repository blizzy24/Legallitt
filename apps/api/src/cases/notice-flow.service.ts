import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable} from '@nestjs/common';
import {z} from 'zod';
import {NoticeAdminCheckSchema, NoticeAdminReturnSchema, NoticeRevisionSchema, NoticeDispatchSchema, NoticeTrackingSchema, NoticeDeliveryResultSchema, NoticeFilingSchema,
  noticeStage, noticeChatWritable, type NoticeDeliveryMethod} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {DocumentStorage} from '../documents/document-storage';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';
import {NOTICE_EMAIL, type NoticeEmailPort} from './notice-email';
import {ensureNoticeLifecycle, requireNoticeRevision, NoticeWorkflowPolicySchema} from './notice-lifecycle';
import {lockedNoticeCase, writeNoticeFlowState, writeNoticeFiling, writeNoticeReassignment, appendCaseEvent} from './case-state-machine';
import type {CaseActor} from './case-access';
import {refundable,recordRefunds} from '../cancellations/cancellations.service';

type Tx = Prisma.TransactionClient;
const admin = (actor: CaseActor) => {if (actor.role !== 'admin') throw new ForbiddenException('Admin action required.');};
const contactsSchema = z.object({methods: z.array(z.enum(['courier', 'email', 'whatsapp'])).min(1), fullName: z.string().optional(), address: z.string().optional(), pin: z.string().optional(), email: z.string().optional(), whatsapp: z.string().optional()});
const serial = <T>(value: T): T => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v));

@Injectable()
export class NoticeFlowService {
  constructor(private readonly prisma: PrismaService, private readonly storage: DocumentStorage,
    @Inject(NOTICE_EMAIL) private readonly email: NoticeEmailPort, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}

  async filing(actor: CaseActor, id: string, body: unknown) {
    const input = parse(NoticeFilingSchema, body), db = await this.prisma.getClient();
    return db.$transaction(tx => writeNoticeFiling(tx, actor, id, input));
  }
  async view(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedNoticeCase(tx, actor, id), life = await ensureNoticeLifecycle(tx, record);
      const policy = parse(NoticeWorkflowPolicySchema, life.policy.config);
      const attempts = await tx.noticeDelivery.findMany({where: {case_id: id}, orderBy: [{method: 'asc'}, {attempt: 'asc'}], include: {tracking: {orderBy: {occurred_at: 'asc'}}}});
      const reviews = await tx.draftReview.findMany({where: {draft_id_relation: {case_id: id}, ...(actor.role === 'client' ? {reviewer_id: actor.id} : {})}, include: {draft_id_relation: {select: {version: true}}}, orderBy: {created_at: 'asc'}});
      const tasks=await this.tasks(tx,id);
      const signature=life.approved_document_id?await tx.noticeSignature.findFirst({where:{case_id:id,document_id:life.approved_document_id,draft_id:life.approved_draft_id??undefined},orderBy:{signed_at:'desc'},select:{id:true,mode:true,signed_at:true,draft_id:true}}):null;
      return serial({case_id: id, reference: record.reference, status: record.status, sub_status: record.sub_status, stage: noticeStage(record), revision: life.revision,
        contacts: life.contacts, handed_to_admin_at: life.handed_to_admin_at, chat: {writable: noticeChatWritable(record, !!life.handed_to_admin_at), reason: life.handed_to_admin_at ? 'Your notice has gone to Legalitt for preparation and dispatch. This chat is now read-only.' : 'Chat opens when your advocate accepts the request.'},
        document_id: actor.role==='client'?record.notice_document_id:life.approved_document_id, draft_id: actor.role === 'client' ? null : life.approved_draft_id,
        deadline_at: life.deadline_at, overdue: !life.handed_to_admin_at && !!life.deadline_at && life.deadline_at < new Date(),
        deadline_alert: !life.handed_to_admin_at && !!life.deadline_at && life.deadline_at.getTime() - Date.now() <= policy.deadline_alert_hours * 3600000,
        esign: {mode: 'test', completed_at: life.test_esigned_at, label: 'Test Aadhaar e-sign — no digital signature is applied'},
        signature,attempts,tasks, reviews: reviews.map(({draft_id_relation, ...r}) => ({...r, version: draft_id_relation.version})),
        retry_courier_paise: policy.retry_courier_paise,test_actions:process.env.ENVIRONMENT==='dev'||process.env.NODE_ENV==='test'});
    });
  }
  async partialRefund(actor:CaseActor,id:string,body:unknown){
    admin(actor);
    const input=parse(NoticeRevisionSchema.extend({amount_paise:z.string().regex(/^[1-9]\d{0,14}$/),reason:z.string().trim().min(3).max(1000)}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,input.revision);
      if(!life.deadline_at||life.deadline_at>=new Date()||life.handed_to_admin_at||['completed','cancelled','refunded'].includes(c.status))throw new ConflictException('This action is available for overdue advocate work before submission to Legalitt.');
      const amount=BigInt(input.amount_paise),money=await refundable(tx,id,c.client_id);
      if(amount>=money.total)throw new BadRequestException('Enter a partial amount below the remaining payment. Use the cancellation review for a full refund.');
      const refunds=await recordRefunds(tx,id,c.client_id,amount,input.reason,null,actor.id);
      await this.bump(tx,id);await this.audit(tx,actor,id,'notice_overdue_partial_refund',{amount_paise:input.amount_paise,reason:input.reason,refund_ids:refunds.map(r=>r.id),simulated:true});
      await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'notice_partial_refund',title:'Partial refund recorded · test',body:`Legalitt recorded a test partial refund for your delayed notice. No money was transferred. ${input.reason} Work on your case continues.`});
      return {amount_paise:input.amount_paise,simulated:true,case_continues:true};
    });
  }
  async reassign(actor:CaseActor,id:string,body:unknown){
    admin(actor);const input=parse(NoticeRevisionSchema.extend({advocate_id:z.uuid(),reason:z.string().trim().min(1).max(1000)}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{const {record:c,previous_advocate_id:previous}=await writeNoticeReassignment(tx,actor,id,input.advocate_id,input.reason,input.revision);
      await this.audit(tx,actor,id,'notice_admin_reassignment',{advocate_id:input.advocate_id,reason:input.reason});
      if(previous)await this.notifications.send(tx,{user_id:previous,case_id:id,kind:'case_reassigned',title:'Case reassigned',body:`${c.reference} has been assigned to another advocate. Contact Legalitt Support if needed.`});
      await this.notifications.send(tx,{user_id:c.advocate_id!,case_id:id,kind:'case_assigned',title:'Legal Notice assigned',body:`${c.reference}: review the existing filing and draft history before accepting.`});
      await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'advocate_assigned',title:'New advocate assigned',body:'We’ve assigned a new advocate to your case to make sure your draft meets our standards.'});return {ok:true};});
  }
  private async audit(tx: Tx, actor: CaseActor, id: string, action: string, payload: Prisma.InputJsonObject = {}) {
    if (actor.role === 'admin') await tx.adminAction.create({data: {admin_id: actor.id, subject_type: 'case', subject_id: id, action, payload}});
    await appendCaseEvent(tx, {case_id: id, actor_id: actor.id, actor_role: actor.role, type: action, source: actor.source ?? 'real', payload});
  }
  private async bump(tx: Tx, id: string) {return tx.noticeLifecycle.update({where: {case_id: id}, data: {revision: {increment: 1}}});}
  private async tasks(tx:Tx,id:string){
    const events=await tx.caseEvent.findMany({where:{case_id:id,type:{in:['notice_task_requested','notice_task_replied','notice_task_resolved']}},orderBy:{id:'asc'}});
    return events.filter(e=>e.type==='notice_task_requested').map(e=>{
      const replies=events.filter(x=>(x.payload as {task_id?:string}).task_id===e.id.toString());
      const reply=replies.slice().reverse().find(x=>x.type==='notice_task_replied');
      const payload=e.payload as {kind:'contact'|'documents';method?:NoticeDeliveryMethod;reason:string};
      return {id:e.id.toString(),created_at:e.created_at,...payload,status:replies.some(x=>x.type==='notice_task_resolved')?'resolved':reply?'responded':'requested',response:reply?.payload??null};
    });
  }
  async requestTask(actor:CaseActor,id:string,body:unknown){
    if(!['admin','advocate'].includes(actor.role))throw new ForbiddenException('Legalitt or the assigned advocate must request corrections.');
    const input=parse(NoticeRevisionSchema.extend({kind:z.enum(['contact','documents']),method:z.enum(['courier','email','whatsapp']).optional(),reason:z.string().trim().min(1).max(1000)}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,input.revision);
      if(['completed','cancelled','refunded'].includes(c.status))throw new ConflictException('This notice is closed.');
      if(actor.role==='advocate'&&(input.kind!=='documents'||life.handed_to_admin_at))throw new ForbiddenException('Legalitt manages contact corrections and post-approval tasks.');
      if(input.kind==='contact'&&(!input.method||!parse(contactsSchema,life.contacts).methods.includes(input.method)))throw new BadRequestException('Choose one of the client’s selected delivery methods.');
      if((await this.tasks(tx,id)).some(t=>t.status!=='resolved'&&t.kind===input.kind&&t.method===input.method))throw new ConflictException('An outstanding task already covers this request.');
      const task=await appendCaseEvent(tx,{case_id:id,actor_id:actor.id,actor_role:actor.role,type:'notice_task_requested',payload:{kind:input.kind,reason:input.reason,...input.method?{method:input.method}:{}}});
      if(input.kind==='documents'&&actor.role==='advocate'){
        if(!noticeChatWritable(c,!!life.handed_to_admin_at))throw new ConflictException('Document requests open after advocate acceptance.');
        const thread=await tx.messageThread.findFirst({where:{case_id:id,kind:'client_advocate'}})??await tx.messageThread.create({data:{case_id:id,kind:'client_advocate'}});
        await tx.message.create({data:{thread_id:thread.id,sender_id:actor.id,body:`Please upload: ${input.reason}`}});
      }
      await this.bump(tx,id);await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'notice_client_task',title:input.kind==='contact'?'Check your delivery details':'Additional documents requested',body:input.reason});
      return {id:task.id.toString()};
    });
  }
  async replyTask(actor:CaseActor,id:string,body:unknown){
    if(actor.role!=='client')throw new ForbiddenException('Only the client can answer this task.');
    const input=parse(NoticeRevisionSchema.extend({task_id:z.string().regex(/^\d+$/),contact:z.object({address:z.string().trim().min(1).max(2000).optional(),pin:z.string().regex(/^[1-9]\d{5}$/).optional(),email:z.email().optional(),whatsapp:z.string().regex(/^(?:\+91)?[6-9]\d{9}$/).optional()}).strict().optional(),document_ids:z.array(z.uuid()).max(20).optional()}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,input.revision);
      const task=(await this.tasks(tx,id)).find(t=>t.id===input.task_id&&t.status==='requested');if(!task)throw new ConflictException('This task was already answered or is unavailable. Refresh.');
      if(task.kind==='contact'){
        if(task.method==='courier'&&(!input.contact?.address||!input.contact.pin)||task.method==='email'&&!input.contact?.email||task.method==='whatsapp'&&!input.contact?.whatsapp)throw new BadRequestException('Complete the requested contact fields.');
      }else{
        if(!input.document_ids?.length)throw new BadRequestException('Upload at least one requested document.');
        for(const documentId of input.document_ids){const d=await this.document(tx,id,documentId);if(d.owner_id!==actor.id||d.kind==='id_proof')throw new BadRequestException('Choose supporting documents you uploaded for this case.');}
      }
      await this.audit(tx,actor,id,'notice_task_replied',{task_id:task.id,...input.contact?{contact:input.contact}:{},...input.document_ids?{document_ids:input.document_ids}:{}});await this.bump(tx,id);
      return {ok:true};
    });
  }
  async resolveTask(actor:CaseActor,id:string,body:unknown){
    admin(actor);const input=parse(NoticeRevisionSchema.extend({task_id:z.string().regex(/^\d+$/),confirmed:z.literal(true)}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,input.revision);
      const task=(await this.tasks(tx,id)).find(t=>t.id===input.task_id&&t.status==='responded');if(!task)throw new ConflictException('The client has not answered this task, or it was already resolved.');
      if(task.kind==='contact'){
        const response=task.response as {contact:Record<string,string>};
        const keys=task.method==='courier'?['address','pin']:task.method==='email'?['email']:['whatsapp'];
        const patch=Object.fromEntries(Object.entries(response.contact).filter(([key])=>keys.includes(key)));
        await tx.noticeLifecycle.update({where:{case_id:id},data:{contacts:{...parse(contactsSchema,life.contacts),...patch}}});
      }
      await this.audit(tx,actor,id,'notice_task_resolved',{task_id:task.id,kind:String(task.kind),...task.method?{method:String(task.method)}:{}});await this.bump(tx,id);
      await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'notice_task_resolved',title:'Your update has been checked',body:'Legalitt has checked the information you provided.'});return {ok:true};
    });
  }
  async extendDeadline(actor:CaseActor,id:string,body:unknown){
    admin(actor);const input=parse(NoticeRevisionSchema.extend({deadline_at:z.iso.datetime({offset:true}),reason:z.string().trim().min(1).max(1000)}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,input.revision);const deadline=new Date(input.deadline_at);
      if(['completed','cancelled','refunded'].includes(c.status)||deadline<=new Date()||life.deadline_at&&deadline<=life.deadline_at)throw new BadRequestException('Choose a later deadline for an open case.');
      await tx.noticeLifecycle.update({where:{case_id:id},data:{deadline_at:deadline,revision:{increment:1}}});await this.audit(tx,actor,id,'notice_deadline_extended',{deadline_at:deadline.toISOString(),reason:input.reason});
      await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'notice_deadline_extended',title:'Your advocate needs a little more time',body:`The updated deadline is ${deadline.toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'})}. ${input.reason}`});return {ok:true};});
  }
  async replyReceived(actor:CaseActor,id:string,body:unknown){
    if(!['client','admin'].includes(actor.role))throw new ForbiddenException('Only the client or admin can upload the reply received.');
    const input=parse(NoticeRevisionSchema.extend({document_id:z.uuid()}),body),db=await this.prisma.getClient();return db.$transaction(async tx=>{
      const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);requireNoticeRevision(life.revision,input.revision);if(c.status!=='completed')throw new ConflictException('Record a reply after notice delivery.');
      const doc=await this.document(tx,id,input.document_id);if(doc.owner_id!==actor.id||doc.kind!=='notice_reply')throw new BadRequestException('Upload the reply received for this case.');
      await this.audit(tx,actor,id,'notice_reply_received',{document_id:doc.id});await this.bump(tx,id);
      if(c.advocate_id)await this.notifications.send(tx,{user_id:c.advocate_id,case_id:id,kind:'notice_reply_received',title:'Reply received',body:'A reply to the notice was uploaded. Open the case to view it.'});
      await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'notice_reply_received',title:'Reply Received',body:'A reply is available in your Legal Notice. Legalitt does not receive replies automatically.'});return {ok:true};
    });
  }
  private async document(tx: Tx, id: string, documentId: string) {
    const document = await tx.document.findFirst({where: {id: documentId, case_id: id, status: 'uploaded'}});
    if (!document) throw new BadRequestException('Use an uploaded document from this case.');
    return document;
  }
  async check(actor: CaseActor, id: string, kind: 'address' | 'notice', body: unknown) {
    admin(actor); const input = parse(NoticeAdminCheckSchema, body), db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const c = await lockedNoticeCase(tx, actor, id), life = await ensureNoticeLifecycle(tx, c);
      requireNoticeRevision(life.revision, input.revision);
      if (!['approved', 'dispatching'].includes(c.status) || c.sub_status !== `notice_admin_${kind === 'address' ? 'address_check' : 'notice_check'}`) throw new ConflictException('This check is no longer available. Refresh the notice.');
      if(kind==='address'){
        const contacts=parse(contactsSchema,life.contacts);
        if(contacts.methods.includes('courier')&&(!contacts.address||!/^[1-9]\d{5}$/.test(contacts.pin??'')))throw new BadRequestException('Verify the postal address and six-digit PIN. Ask the client to correct missing details.');
        if(contacts.methods.includes('email')&&!z.email().safeParse(contacts.email).success)throw new BadRequestException('Ask the client to correct the delivery email.');
        if(contacts.methods.includes('whatsapp')&&!/^(?:\+91)?[6-9]\d{9}$/.test(contacts.whatsapp??''))throw new BadRequestException('Ask the client to correct the WhatsApp number.');
      }
      if (kind === 'notice') {
        if (!life.approved_document_id || !life.approved_draft_id) throw new ConflictException('The approved PDF is missing. Return the notice for correction.');
        await this.document(tx, id, life.approved_document_id);
      }
      await tx.noticeLifecycle.update({where: {case_id: id}, data: {revision: {increment: 1}, ...(kind === 'address' ? {address_checked_at: new Date()} : {notice_checked_at: new Date()})}});
      await writeNoticeFlowState(tx, actor, id, {status: c.status, sub_status: kind === 'address' ? 'notice_admin_notice_check' : (await tx.noticeSignature.findFirst({where:{case_id:id,document_id:life.approved_document_id!}})||life.test_esigned_at?'notice_admin_ready_for_dispatch':'notice_admin_awaiting_test_esign')}, `notice_${kind}_checked`);
      await this.audit(tx, actor, id, `notice_${kind}_check`, {draft_id: life.approved_draft_id});
      if (kind === 'notice' && c.advocate_id&&!await tx.noticeSignature.findFirst({where:{case_id:id,document_id:life.approved_document_id!}})&&!life.test_esigned_at) await this.notifications.send(tx, {user_id: c.advocate_id, case_id: id, kind: 'notice_esign_requested', title: 'Complete the test e-sign step', body: 'This is a test step. No digital signature will be applied.'});
      return {ok: true};
    });
  }
  async returnDraft(actor: CaseActor, id: string, body: unknown) {
    admin(actor); const input = parse(NoticeAdminReturnSchema, body), db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const c = await lockedNoticeCase(tx, actor, id), life = await ensureNoticeLifecycle(tx, c);
      requireNoticeRevision(life.revision, input.revision);
      if (!['approved', 'dispatching'].includes(c.status) || !['notice_admin_address_check', 'notice_admin_notice_check', 'notice_admin_awaiting_test_esign', 'notice_admin_ready_for_dispatch'].includes(c.sub_status ?? '') || !life.approved_draft_id) throw new ConflictException('This notice cannot be returned at this stage.');
      if (await tx.noticeDelivery.count({where: {case_id: id, status: {in: ['sending', 'sent', 'unknown', 'delivered']}}})) throw new ConflictException('Dispatch has begun. Resolve delivery before changing the notice.');
      await tx.draftReview.create({data: {draft_id: life.approved_draft_id, reviewer_id: actor.id, reviewer_role: 'admin', decision: 'changes_requested', comment: input.reason}});
      await tx.noticeLifecycle.update({where: {case_id: id}, data: {revision: {increment: 1}, notice_checked_at: null, test_esigned_at: null}});
      // Internal reason lives on the review, not a client-visible timeline event.
      await writeNoticeFlowState(tx, actor, id, {status: 'changes_requested', sub_status: 'notice_admin_advocate_correction'}, 'notice_admin_returned');
      await this.audit(tx, actor, id, 'notice_draft_returned', {draft_id: life.approved_draft_id});
      if (c.advocate_id) await this.notifications.send(tx, {user_id: c.advocate_id, case_id: id, kind: 'notice_admin_returned', title: 'Legalitt requested corrections', body: input.reason});
      return {ok: true};
    });
  }
  async testEsign(actor: CaseActor, id: string, body: unknown) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required.');
    const input = parse(NoticeAdminCheckSchema, body), db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const c = await lockedNoticeCase(tx, actor, id), life = await ensureNoticeLifecycle(tx, c);
      requireNoticeRevision(life.revision, input.revision);
      if (c.sub_status !== 'notice_admin_awaiting_test_esign' || !life.notice_checked_at) throw new ConflictException('Wait for the admin notice check.');
      await tx.noticeLifecycle.update({where: {case_id: id}, data: {test_esigned_at: new Date(), revision: {increment: 1}}});
      // No file transformation and no claim that a signature exists.
      await writeNoticeFlowState(tx, actor, id, {status: c.status, sub_status: 'notice_admin_ready_for_dispatch'}, 'notice_test_esign_completed', {simulated: true, digital_signature_applied: false});
      return {simulated: true, digital_signature_applied: false};
    });
  }
  async dispatch(actor: CaseActor, id: string, body: unknown) {
    admin(actor); const input = parse(NoticeDispatchSchema, body), db = await this.prisma.getClient();
    // Commit the attempt BEFORE calling SES. An uncertain request cannot be resent
    // by a second tap, and a crash leaves an explicit sending/unknown admin task.
    const prepared = await db.$transaction(async tx => {
      const c = await lockedNoticeCase(tx, actor, id), life = await ensureNoticeLifecycle(tx, c);
      requireNoticeRevision(life.revision, input.revision);
      if (!['notice_admin_ready_for_dispatch', 'notice_delivery_in_progress', 'notice_delivery_failed'].includes(c.sub_status ?? '') || !life.approved_document_id || !life.test_esigned_at&&!await tx.noticeSignature.findFirst({where:{case_id:id,document_id:life.approved_document_id!,draft_id:life.approved_draft_id??undefined}})) throw new ConflictException('Complete admin checks and the test e-sign first.');
      const contacts = parse(contactsSchema, life.contacts);
      if (!contacts.methods.includes(input.method)) throw new BadRequestException('This delivery method was not selected by the client.');
      if(input.method==='email')this.email.assertReady?.();
      const previous = await tx.noticeDelivery.findFirst({where: {case_id: id, method: input.method}, orderBy: {attempt: 'desc'}});
      if (previous && previous.status !== 'failed') throw new ConflictException('This delivery is already in progress or complete. Check its status before retrying.');
      const retryPayment=previous&&input.method==='courier'?await tx.payment.findFirst({where:{case_id:id,payer_id:c.client_id,purpose:'notice_courier_retry',status:'captured',idempotency_key:`notice-courier-retry:${previous.id}`}}):null;
      if(previous&&input.method==='courier'&&!retryPayment)throw new ConflictException('A new courier attempt requires the client’s retry payment.');
      if((await this.tasks(tx,id)).some(t=>t.kind==='contact'&&t.method===input.method&&t.status!=='resolved'))throw new ConflictException('Verify the client’s contact correction before dispatching.');
      if (input.method === 'courier' && (!input.carrier || !input.waybill || !input.dispatch_date)) throw new BadRequestException('Enter the courier name, waybill and dispatch date.');
      if (input.method === 'email' && !z.email().safeParse(contacts.email).success) throw new BadRequestException('Verify the delivery email first.');
      if (input.method === 'whatsapp' && !input.manual_confirmation) throw new BadRequestException('Confirm that you sent the notice manually through WhatsApp.');
      if (input.receipt_document_id) await this.document(tx, id, input.receipt_document_id);
      const document = await this.document(tx, id, life.approved_document_id);
      const attempt = await tx.noticeDelivery.create({data: {case_id: id, method: input.method, attempt: (previous?.attempt ?? 0) + 1,
        status: input.method === 'email' ? 'sending' : 'sent', recipient: contacts, document_id: document.id,
        carrier: input.carrier, waybill: input.waybill, dispatch_date: input.dispatch_date ? new Date(input.dispatch_date) : undefined,
        receipt_document_id: input.receipt_document_id,retry_payment_id:retryPayment?.id, source: input.method === 'email' ? 'ses' : 'manual', sent_at: input.method === 'email' ? null : new Date()}});
      await this.bump(tx, id);
      await writeNoticeFlowState(tx, actor, id, {status: 'dispatched', sub_status: 'notice_delivery_in_progress', notice_document_id: document.id}, 'notice_dispatch_started', {attempt_id: attempt.id, method: input.method, manual: input.method !== 'email'});
      return {attempt, document, reference: c.reference, email: contacts.email};
    });
    if (input.method !== 'email') return serial(prepared.attempt);
    let message: Awaited<ReturnType<NoticeEmailPort['send']>>;
    try {
      const info = await this.storage.head(prepared.document.s3_key);
      if (!info) throw new Error('Approved PDF is unavailable.');
      const pdf = await this.storage.read(prepared.document.s3_key, info);
      message = await this.email.send({to: prepared.email!, reference: prepared.reference, pdf, attemptId: prepared.attempt.id});
    } catch {
      await db.$transaction(async tx => {
        await lockedNoticeCase(tx, actor, id);
        await tx.noticeDelivery.updateMany({where: {id: prepared.attempt.id,status:'sending'}, data: {status: 'unknown', failure_reason: 'The email outcome is not confirmed. Check SES records before marking failed or retrying.'}});
        await this.bump(tx, id);
        await this.audit(tx, actor, id, 'notice_email_outcome_unknown', {attempt_id: prepared.attempt.id});
      });
      throw new ConflictException('Email outcome is not confirmed. Check SES records before retrying; another email has not been sent.');
    }
    return db.$transaction(async tx => {
      await lockedNoticeCase(tx, actor, id);
      await tx.noticeDelivery.updateMany({where:{id:prepared.attempt.id,status:'sending'},data:{status:'sent',provider_message_id:message.messageId,sent_at:new Date(),source:message.simulated?'simulated':'ses'}});
      const result=await tx.noticeDelivery.findUniqueOrThrow({where:{id:prepared.attempt.id}});
      await this.bump(tx, id);
      await this.audit(tx, actor, id, 'notice_email_sent', {attempt_id: result.id, simulated: message.simulated});
      return serial(result);
    });
  }
  async tracking(actor: CaseActor, id: string, body: unknown) {
    admin(actor); const input = parse(NoticeTrackingSchema, body), db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const c = await lockedNoticeCase(tx, actor, id), life = await ensureNoticeLifecycle(tx, c);
      requireNoticeRevision(life.revision, input.revision);
      const attempt = await tx.noticeDelivery.findFirst({where: {id: input.attempt_id, case_id: id, method: 'courier', status: 'sent'}});
      if (!attempt) throw new ConflictException('Choose an active courier delivery from this case.');
      await tx.noticeDeliveryEvent.create({data: {delivery_id: attempt.id, actor_id: actor.id, occurred_at: new Date(input.occurred_at), place: input.place, text: input.text}});
      await this.bump(tx, id);
      await this.audit(tx, actor, id, 'notice_tracking_updated', {attempt_id: attempt.id});
      return {ok: true};
    });
  }
  async result(actor: CaseActor, id: string, body: unknown) {
    admin(actor); const input = parse(NoticeDeliveryResultSchema, body), db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const c = await lockedNoticeCase(tx, actor, id), life = await ensureNoticeLifecycle(tx, c);
      requireNoticeRevision(life.revision, input.revision);
      if (c.status !== 'dispatched') throw new ConflictException('This notice is not awaiting delivery.');
      const attempt = await tx.noticeDelivery.findFirst({where: {id: input.attempt_id, case_id: id, status: {in: ['sent', 'unknown', 'sending']}}});
      if (!attempt) throw new ConflictException('This attempt has already been resolved or belongs to another case.');
      if(attempt.status==='sending')throw new ConflictException('The email send is still in progress. Wait for its outcome before recording delivery or failure.');
      if (input.result === 'failed' && !input.reason) throw new BadRequestException('Explain why delivery failed.');
      if (input.result === 'delivered' && attempt.method === 'courier' && (!input.proof_document_id || !input.received_by)) throw new BadRequestException('Upload proof of delivery and enter who received it.');
      if (input.proof_document_id) await this.document(tx, id, input.proof_document_id);
      await tx.noticeDelivery.update({where: {id: attempt.id}, data: {status: input.result, failure_reason: input.result === 'failed' ? input.reason : null,
        delivered_at: input.result === 'delivered' ? new Date(input.occurred_at) : null, received_by: input.received_by, proof_document_id: input.proof_document_id}});
      if(input.result==='failed'&&!(await this.tasks(tx,id)).some(t=>t.kind==='contact'&&t.method===attempt.method&&t.status!=='resolved'))await appendCaseEvent(tx,{case_id:id,actor_id:actor.id,actor_role:actor.role,type:'notice_task_requested',payload:{kind:'contact',method:attempt.method,reason:`Please check or update the ${attempt.method} contact. ${input.reason}`}});
      await this.bump(tx, id);
      const contacts = parse(contactsSchema, life.contacts), all = await tx.noticeDelivery.findMany({where: {case_id: id}, orderBy: {attempt: 'desc'}});
      const complete = contacts.methods.every(method => all.find(a => a.method === method)?.status === 'delivered');
      await writeNoticeFlowState(tx, actor, id, {status: complete ? 'completed' : 'dispatched', sub_status: complete ? null : input.result === 'failed' ? 'notice_delivery_failed' : 'notice_delivery_in_progress'}, complete ? 'notice_delivered' : `notice_delivery_${input.result}`, {attempt_id: attempt.id, method: attempt.method});
      await this.audit(tx, actor, id, 'notice_delivery_result', {attempt_id: attempt.id, result: input.result});
      await this.notifications.send(tx, {user_id: c.client_id, case_id: id, kind: `notice_delivery_${input.result}`, title: complete ? 'Your notice has been delivered' : input.result === 'failed' ? 'Delivery needs attention' : `${attempt.method} delivery confirmed`, body: input.result === 'failed' ? `We could not deliver by ${attempt.method}. ${input.reason}` : 'View your notice for the delivery record.'});
      if (complete && c.advocate_id) await this.notifications.send(tx, {user_id: c.advocate_id, case_id: id, kind: 'notice_completed', title: 'Notice delivered', body: 'Your recorded case entitlement is now available in your wallet.'});
      return {completed: complete};
    });
  }
}
