import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable} from '@nestjs/common';
import {FIR_AWAITING_APPROVAL, FirDraftSchema, FirIntakeSchema, FirSendSchema} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {lockedCase,writeFirIntake,writeFirDraftSaved,writeFirSubmitted,writeFirApproved} from './case-state-machine';
import type {CaseActor} from './case-access';
import {DocumentService} from '../documents/document.service';
import {renderFirPdf} from '../documents/fir-pdf';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

@Injectable()
export class FirService {
  constructor(private readonly prisma: PrismaService, private readonly documents: DocumentService,
    @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  async intake(actor: CaseActor, id: string, body: unknown) {
    const details = parse(FirIntakeSchema, body);
    if (actor.role !== 'client') throw new ForbiddenException('Case client required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx,actor,id,'fir_draft');
      if (record.status !== 'draft') throw new ConflictException('Submitted intake cannot be edited');
      return writeFirIntake(tx,actor,id,details);
    });
  }
  async save(actor: CaseActor, id: string, body: unknown) {
    const content = parse(FirDraftSchema,body);
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx,actor,id,'fir_draft');
      if (!['advocate_accepted','in_progress'].includes(record.status) || record.sub_status === FIR_AWAITING_APPROVAL)
        throw new ConflictException('The submitted draft is frozen while awaiting admin approval. A second version cannot be saved or sent.');
      for (const docId of content.document_ids) if (!await tx.document.findFirst({where:{id:docId,case_id:id,status:'uploaded',kind:{not:'fir_draft'}}}))
        throw new BadRequestException('Choose uploaded evidence from this case');
      const last = await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
      const draft = await tx.draft.create({data:{case_id:id,kind:'fir_proforma',version:(last?.version ?? 0)+1,content,created_by:actor.id,generated_by:'manual'}});
      await writeFirDraftSaved(tx,actor,id,draft);
      return draft;
    });
  }
  async send(actor: CaseActor, id: string, draftId: string) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    const input = await db.$transaction(async tx => {
      const record = await lockedCase(tx,actor,id,'fir_draft');
      if (record.status !== 'in_progress' || record.sub_status === FIR_AWAITING_APPROVAL)
        throw new ConflictException('A draft is already awaiting approval, or this case is not being drafted. A second submission is blocked.');
      const draft = await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
      if (!draft || draft.id !== draftId) throw new ConflictException('Refresh to use the latest draft');
      const content = parse(FirSendSchema,draft.content);
      const evidence = await tx.document.findMany({where:{id:{in:content.document_ids},case_id:id,status:'uploaded',kind:{not:'fir_draft'}}});
      if (evidence.length !== content.document_ids.length) throw new ConflictException('An attached document is unavailable. Refresh and review the draft.');
      return {record,draft,content,evidence};
    });
    let bytes: Uint8Array;
    try {bytes = await renderFirPdf(input.record.reference,input.content,input.evidence.map(d => d.filename));}
    catch(e) {throw new BadRequestException(e instanceof Error ? e.message : 'Unable to render FIR PDF');}
    const ticket = await this.documents.presign(actor,{case_id:id,kind:'fir_draft',filename:`FIR_Draft_v${input.draft.version}.pdf`,mime:'application/pdf'});
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
        if (await tx.document.count({where:{id:{in:input.content.document_ids},case_id:id,status:'uploaded'}}) !== input.content.document_ids.length)
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
  async approve(actor: CaseActor, id: string, draftId: string) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin approval required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx,actor,id,'fir_draft');
      const sent = await tx.caseEvent.findFirst({where:{case_id:id,type:'fir_draft_submitted'}});
      const submitted = sent?.payload as {draft_id?:string;document_id?:string;version?:number} | undefined;
      if (submitted?.draft_id !== draftId) throw new ConflictException('Refresh to review the submitted draft');
      if (record.status === 'completed' && await tx.draftReview.findFirst({where:{draft_id:draftId,decision:'approved'}})) return record;
      if (record.status !== 'in_progress' || record.sub_status !== FIR_AWAITING_APPROVAL)
        throw new ConflictException('This case is not awaiting admin approval');
      const draft = await tx.draft.findFirst({where:{id:draftId,case_id:id,document_id:submitted.document_id}});
      const doc = submitted.document_id ? await tx.document.findFirst({where:{id:submitted.document_id,case_id:id,status:'uploaded',kind:'fir_draft'}}) : null;
      if (!draft || !doc) throw new ConflictException('The submitted PDF is unavailable. Reload the case; approval cannot continue.');
      const now = new Date();
      await tx.draftReview.create({data:{draft_id:draftId,reviewer_id:actor.id,decision:'approved',created_at:now}});
      const updated = await writeFirApproved(tx,actor,id,{draft_id:draftId,version:draft.version,document_id:doc.id},now);
      await tx.adminAction.create({data:{admin_id:actor.id,action:'approve_fir_draft',subject_type:'case',subject_id:id,payload:{draft_id:draftId,version:submitted.version,document_id:doc.id}}});
      await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'fir_ready',title:'Your FIR draft is ready',body:record.reference});
      if(record.advocate_id) await this.notifications.send(tx,{user_id:record.advocate_id,case_id:id,kind:'fir_approved',title:'Admin approved the FIR draft',body:record.reference});
      return updated;
    });
  }
}
