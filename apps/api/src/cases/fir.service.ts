import {FirAdminService} from './fir-admin.service';
import {ensureFirLifecycle} from './fir-lifecycle';
import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable} from '@nestjs/common';
import {createHash,randomUUID} from 'node:crypto';
import {maskedIdentity, FIR_AWAITING_APPROVAL, FirDraftSaveSchema, FirDraftContentSchema, FirIntakeSchema, FirIntakeSaveSchema, firIntakeDetails, assembleFirDraft, seedFirDraft, firDraftProblems, type FirDraftContent, type FirIntake} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {lockedCase,writeFirIntake,writeFirDraftSaved,writeFirSubmitted} from './case-state-machine';
import type {CaseActor} from './case-access';
import {DocumentService} from '../documents/document.service';
import {renderFirPdf} from '../documents/fir-pdf';
import {firIdentityPolicy,requireFirIdentity} from '../documents/fir-identity';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

@Injectable()
export class FirService {
  constructor(private readonly prisma: PrismaService, private readonly documents: DocumentService,
    @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  async intake(actor: CaseActor, id: string, body: unknown) {
    const {expected_updated_at,...details} = parse(FirIntakeSaveSchema, body);
    if (actor.role !== 'client') throw new ForbiddenException('Case client required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx,actor,id,'fir_draft');
      if (record.status !== 'draft') throw new ConflictException('Submitted intake cannot be edited');
      if((record.details as {intake_version?:number}).intake_version===2&&details.intake_version!==2)
        throw new ConflictException('Reload this case to use the current intake form.');
      if(expected_updated_at&&record.updated_at.toISOString()!==expected_updated_at)
        throw new ConflictException('This intake changed in another session. Your unsaved entries are still on screen. Reload the saved case before editing again.');
      return writeFirIntake(tx,actor,id,details);
    });
  }
  async save(actor: CaseActor, id: string, body: unknown) {
    const input = parse(FirDraftSaveSchema,body);
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx,actor,id,'fir_draft');
      if (!['advocate_accepted','in_progress','changes_requested'].includes(record.status) || record.sub_status === FIR_AWAITING_APPROVAL)
        throw new ConflictException('The submitted draft is frozen while awaiting admin approval. A second version cannot be saved or sent.');
      const last = await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
      if((last?.id??null)!==input.base_draft_id)throw new ConflictException('A newer FIR draft was saved in another session. Your unsaved edits are still on screen. Reload the saved version before editing again.');
      // Flow A5 auto-save updates a working version in place: only the advocate's own,
      // current-assignment version that was never sent (the same test as `requires_new_version`).
      // A sent version stays exactly as reviewed; Save Draft makes the next one.
      if(input.autosave){
        const stored=FirDraftContentSchema.safeParse(last?.content),{assignment}=await ensureFirLifecycle(tx,record);
        if(!last||!stored.success||last.created_by!==actor.id||(!!assignment&&last.created_at<assignment.assigned_at)||await tx.firSubmission.findUnique({where:{draft_id:last.id}}))
          throw new ConflictException('This version can’t be auto-saved in place. Use Save Draft to save a new version.');
        if(stored.data.filing_snapshot.captured_at!==input.base_saved_at)throw new ConflictException('A newer FIR draft was saved in another session. Your unsaved edits are still on screen. Reload the saved version before editing again.');
      }
      const intake=parse(FirIntakeSchema,firIntakeDetails(record.details,await tx.caseParty.findMany({where:{case_id:id}})));
      const hash=filingHash(intake);
      if(hash!==input.filing_hash)throw new ConflictException('The client filing changed. Reload and review the filing before saving this draft.');
      for(const [kind,group]of [['accused',input.content.accused],['witness',input.content.witnesses]]as const)
        if(group?.status==='listed')for(const person of group.items)if(person.source_party_id&&!intake.people.some(p=>p.id===person.source_party_id&&p.kind===kind))throw new BadRequestException('A source person must belong to this case’s filing');
      const docs=await tx.document.findMany({where:{id:{in:input.content.attachment_ids},case_id:id,status:'uploaded',kind:{not:'fir_draft'}}});
      if(docs.length!==input.content.attachment_ids.length)throw new BadRequestException('Choose uploaded evidence from this case');
      if(input.content.identity_document_id){
        if(!docs.some(d=>d.id===input.content.identity_document_id&&d.kind==='id_proof'))throw new BadRequestException('Include the selected identity document from this case in attachments');
        await requireFirIdentity(tx,id,input.content.identity_document_id);
      }
      const content=assembleFirDraft(id,intake,hash,new Date().toISOString(),input.content,input.content.attachment_ids.map(docId=>{const d=docs.find(d=>d.id===docId)!;return {document_id:d.id,filename:d.filename,mime_type:d.mime_type as FirDraftContent['attachments'][number]['mime_type']};}));
      if(input.autosave&&last){
        // Same validation and filing-hash check as a version; no new version and no event.
        // Only a first save still moves the case advocate_accepted → in_progress (through the writer).
        const draft=await tx.draft.update({where:{id:last.id},data:{content}});
        if(record.status==='advocate_accepted')await writeFirDraftSaved(tx,actor,id,draft);
        return draft;
      }
      const draft = await tx.draft.create({data:{case_id:id,kind:'fir_proforma',version:(last?.version ?? 0)+1,content,created_by:actor.id,generated_by:'manual'}});
      await writeFirDraftSaved(tx,actor,id,draft);
      return draft;
    });
  }
  async context(actor:CaseActor,id:string){
    if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
    const db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await lockedCase(tx,actor,id,'fir_draft');
      const intake=parse(FirIntakeSchema,firIntakeDetails(record.details,await tx.caseParty.findMany({where:{case_id:id}})));
      const latest=await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
      const parsed=FirDraftContentSchema.safeParse(latest?.content);
      const {assignment}=await ensureFirLifecycle(tx,record);
      const requires_new_version=!!latest&&(latest.created_by!==actor.id||!!await tx.firSubmission.findUnique({where:{draft_id:latest.id}})||!!assignment&&latest.created_at<assignment.assigned_at);
      return {requires_new_version,identity_policy:await firIdentityPolicy(tx),intake,filing_hash:filingHash(intake),latest_draft_id:latest?.id??null,latest_version:latest?.version??0,latest_content:parsed.success?parsed.data:null,legacy_content:latest&&!parsed.success?latest.content:null,initial_content:seedFirDraft(intake,randomUUID)};
    });
  }
  private async renderable(actor:CaseActor,id:string,draftId:string){
    if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
    const db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await lockedCase(tx,actor,id,'fir_draft');
      if(record.status!=='in_progress'||record.sub_status===FIR_AWAITING_APPROVAL)throw new ConflictException('Draft cannot be generated in this state');
      const draft=await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
      if(!draft||draft.id!==draftId)throw new ConflictException('Refresh to use the latest draft');
      const result=FirDraftContentSchema.safeParse(draft.content);
      if(!result.success)throw new ConflictException('This legacy draft must be reviewed and saved in the structured editor before generation.');
      const content=result.data,intake=parse(FirIntakeSchema,firIntakeDetails(record.details,await tx.caseParty.findMany({where:{case_id:id}})));
      if(content.filing_snapshot.intake_hash!==filingHash(intake))throw new ConflictException('Client filing changed. Save a reviewed draft with the current filing before generation.');
      const {assignment}=await ensureFirLifecycle(tx,record);
      if(draft.created_by!==record.advocate_id||!assignment||draft.created_at<assignment.assigned_at)throw new ConflictException('Save your own reviewed version before generation.');
      if(await tx.firIdentityReturn.count({where:{case_id:id,state:{in:['replacement_required','review_pending']}}}))throw new ConflictException('Identity replacement must be accepted by admin before generation.');
      if(await tx.firSubmission.findUnique({where:{draft_id:draftId}}))throw new ConflictException('Save a new draft version after a return before generating or sending.');
      const issues=firDraftProblems(content);
      if(issues.length)throw new BadRequestException({message:issues.map(i=>i.message).join('\n'),issues});
      await requireFirIdentity(tx,id,content.complainant.identity_document_id!);
      // Flow A5 §2: the identity document is printed by type and masked number, never its file name.
      const identityDoc=await tx.document.findUnique({where:{id:content.complainant.identity_document_id!}}),policy=await firIdentityPolicy(tx);
      const typeLabel=policy.accepted_documents.find(t=>t.code===(identityDoc?.identity_evidence as {document_type?:string}|null)?.document_type)?.label;
      const identity=[typeLabel,maskedIdentity(identityDoc?.identity_last4)&&`(${maskedIdentity(identityDoc?.identity_last4)})`].filter(Boolean).join(' ')||null;
      const ids=content.attachments.map(d=>d.document_id);
      const evidence=await tx.document.findMany({where:{id:{in:ids},case_id:id,status:'uploaded',kind:{not:'fir_draft'}}});
      if(evidence.length!==ids.length||content.attachments.some(a=>!evidence.some(d=>d.id===a.document_id&&d.filename===a.filename&&d.mime_type===a.mime_type)))throw new ConflictException('An attached document changed or is unavailable. Review attachments and save a new version.');
      return {record,draft,content,identity};
    });
  }
  async preview(actor:CaseActor,id:string,draftId:string){
    const input=await this.renderable(actor,id,draftId);
    let bytes:Uint8Array;
    try{bytes=await renderFirPdf(input.record.reference,input.content,{identity:input.identity});}
    catch(e){throw new BadRequestException(e instanceof Error?e.message:'Unable to render FIR PDF');}
    await this.renderable(actor,id,draftId);
    return {filename:`FIR_Draft_${input.record.reference}_v${input.draft.version}.pdf`,pdf_base64:Buffer.from(bytes).toString('base64')};
  }
  async send(actor: CaseActor, id: string, draftId: string) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    const input = await this.renderable(actor,id,draftId);
    let bytes: Uint8Array;
    try {bytes = await renderFirPdf(input.record.reference,input.content,{identity:input.identity});}
    catch(e) {throw new BadRequestException(e instanceof Error ? e.message : 'Unable to render FIR PDF');}
    const ticket = await this.documents.presign(actor,{case_id:id,kind:'fir_draft',filename:`FIR_Draft_${input.record.reference}_v${input.draft.version}.pdf`,mime:'application/pdf'});
    try {
      const form = new FormData();
      for (const [key,value] of Object.entries(ticket.upload.fields)) form.append(key,value);
      form.append('file',new Blob([Buffer.from(bytes)],{type:'application/pdf'}),ticket.document.filename);
      const response = await fetch(ticket.upload.url,{method:'POST',body:form});
      if (!response.ok) throw new ConflictException('PDF upload failed. Retry sending the draft.');
      await this.documents.complete(actor,ticket.document.id);
      return await db.$transaction(async tx => {
        const record = await lockedCase(tx,actor,id,'fir_draft');
        const latest = await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
        if (record.status !== 'in_progress' || record.sub_status === FIR_AWAITING_APPROVAL || latest?.id !== draftId)
          throw new ConflictException('The case changed. Refresh; only one submitted version may await approval.');
        // An auto-save can update an unsent version in place: send only the content that was rendered.
        if ((latest.content as {filing_snapshot?:{captured_at?:string}}|null)?.filing_snapshot?.captured_at !== input.content.filing_snapshot.captured_at)
          throw new ConflictException('The draft was auto-saved while sending. Review it and send again.');
        const currentIntake=parse(FirIntakeSchema,firIntakeDetails(record.details,await tx.caseParty.findMany({where:{case_id:id}})));
        if(filingHash(currentIntake)!==input.content.filing_snapshot.intake_hash)throw new ConflictException('Client filing changed during generation. Review and save again.');
        await requireFirIdentity(tx,id,input.content.complainant.identity_document_id!);
        if (await tx.document.count({where:{id:{in:input.content.attachments.map(d=>d.document_id)},case_id:id,status:'uploaded'}}) !== input.content.attachments.length)
          throw new ConflictException('Evidence changed. Refresh and review before sending.');
        await tx.draft.update({where:{id:draftId},data:{document_id:ticket.document.id}});
        const updated = await writeFirSubmitted(tx,actor,id,{draft_id:draftId,version:input.draft.version,document_id:ticket.document.id});
        for (const admin of await tx.user.findMany({where:{role:'admin',status:'active'}}))
          await this.notifications.send(tx,{user_id:admin.id,case_id:id,kind:'fir_approval_needed',title:'FIR draft awaiting admin approval',body:record.reference});
        return updated;
      });
    } catch (error) {
      // Unlinked losing concurrent submissions never become visible to the client.
      await this.documents.delete(actor,ticket.document.id).catch(() => undefined);
      throw error;
    }
  }
  async approve(actor:CaseActor,id:string,draftId:string,body?:unknown){return new FirAdminService(this.prisma,this.documents,this.notifications).approve(actor,id,draftId,body);}
}

function filingHash(intake:FirIntake){return createHash('sha256').update(JSON.stringify(intake)).digest('hex');}
