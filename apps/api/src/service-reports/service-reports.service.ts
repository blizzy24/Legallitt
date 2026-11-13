import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {
  ChangeItemsSchema, ForensicReportSaveSchema, INDIA_JURISDICTIONS, REPORT_AWAITING_APPROVAL, REPORT_INTAKE_SCHEMAS,
  REPORT_SERVICE_CONFIG, ReportIntakeSaveSchema, UploadReportSaveSchema, FORENSIC_DOCUMENT_TYPES, PROPERTY_TYPES,
  isReportService, isServiceOffered, labelOf, reportIntakeProblems, type QuoteBreakdown, type ReportDraftContent, type ReportPricing,
  type ReportServiceCode,
  PropertyReportSaveSchema,
  isFlowReportService,ReportWorkflowPolicySchema,
} from '@legalitt/shared';
import {z} from 'zod';
import {PDFDocument} from 'pdf-lib';
import type {Prisma} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {CaseStateMachine, lockedCase} from '../cases/case-state-machine';
import type {CaseActor} from '../cases/case-access';
import {DocumentService} from '../documents/document.service';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';
import {activeAt, newest} from '../payments/price-quotes';
import {calculateQuote} from '../payments/quote-math';
import {DRAFT_KIND, writeReportChangesRequested, writeReportIntake, writeReportReleased, writeReportSaved, writeReportSubmitted} from './report-lifecycle';
import {renderForensicPdfs,renderPropertyPdf} from './report-pdf';
import {ensureReportWorkflow,reportCorrectionAllowed} from './report-workflow';
import {validateReportJurisdiction} from './report-validation';

type Locked = Awaited<ReturnType<typeof lockedCase>>;
const service = (record: Locked): ReportServiceCode => {
  if (!isReportService(record.service_code)) throw new NotFoundException('Case not found');
  return record.service_code;
};

@Injectable()
export class ServiceReportsService {
  constructor(private readonly prisma: PrismaService, private readonly state: CaseStateMachine,
    private readonly documents: DocumentService, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}

  async intake(actor: CaseActor, id: string, body: unknown) {
    const input = parse(ReportIntakeSaveSchema, body);
    if (actor.role !== 'client') throw new ForbiddenException('Case client required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, id);
      const code = service(record), config = REPORT_SERVICE_CONFIG[code];
      if (record.status !== 'draft') throw new ConflictException('Submitted requests cannot be edited');
      if (input.expected_updated_at && record.updated_at.toISOString() !== input.expected_updated_at)
        throw new ConflictException('This request changed in another session. Your entries are still on screen. Reload before editing again.');
      const details = parse(REPORT_INTAKE_SCHEMAS[code] as unknown as z.ZodType<Record<string, unknown>>, input.details);
      validateReportJurisdiction(details);
      if (input.tier !== undefined && input.tier !== null && !(config.tiers as readonly string[]).includes(input.tier))
        throw new BadRequestException('This service has no such speed option');
      const matter = code === 'property_search' ? details.property_type : code === 'document_forensic' ? details.document_type : null;
      return writeReportIntake(tx, actor, id, {details: details as Prisma.InputJsonObject,
        ...(input.tier !== undefined ? {tier: config.tiers.length ? input.tier : null} : {}),
        matter_type: typeof matter === 'string' ? matter : null});
    });
  }

  /** Current provisional tariffs and their exact client totals before any page overage. */
  async pricing(code: string): Promise<ReportPricing> {
    // Q79/Q113: a hidden service (HIDDEN_SERVICES) publishes no price list.
    if (!isReportService(code) || !isServiceOffered(code)) throw new NotFoundException('Service not found');
    const db = await this.prisma.getClient(), now = new Date();
    const rows = await db.servicePricing.findMany({where: {service_code: code, variant: null, fee_policy_id: {not: null}, ...activeAt(now)},
      orderBy: [{confirmed:'desc'},...newest], include: {fee_policy: {include: {page_overage_policy: true}}}});
    const commission = await db.commissionRate.findFirst({where: {service_code: code, confirmed: true, ...activeAt(now)}, orderBy: newest});
    const tiers: ReportPricing['tiers'] = [];
    const wanted = REPORT_SERVICE_CONFIG[code].tiers.length ? REPORT_SERVICE_CONFIG[code].tiers : [null];
    for (const tier of wanted) {
      const row = rows.find(r => r.tier === tier);
      if (!row || !commission || !row.fee_policy) continue;
      const page = row.fee_policy.page_overage_policy;
      const b = calculateQuote({base: row.base_amount_paise, commissionBps: commission.rate_bps, gstBps: row.gst_bps, delivery: 0n,
        pages: 0, includedPages: page.included_pages, pagePrice: page.unit_amount_paise, pageGstBps: page.gst_bps});
      tiers.push({tier, pricing_id: row.id, base_amount_paise: b.service_fee_paise, platform_fee_paise: b.platform_fee_paise,
        gst_paise: b.gst_paise, total_paise: b.total_paise, included_pages: page.included_pages, page_unit_paise: page.unit_amount_paise.toString()});
    }
    const used = rows.filter(r => tiers.some(t => t.pricing_id === r.id));
    const policy=isFlowReportService(code)?await db.reportWorkflowPolicy.findFirst({where:{service_code:code,effective_from:{lte:now}},orderBy:{version:'desc'}}):null;
    return {service_code: code, confirmed: used.length > 0 && used.every(r => r.confirmed), tiers,...(policy?{workflow:{id:policy.id,version:policy.version,config:ReportWorkflowPolicySchema.parse(policy.config)}}:{})};
  }

  async start(actor: CaseActor, id: string) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    const record = await db.$transaction(tx => lockedCase(tx, actor, id));
    service(record);
    if (record.status === 'in_progress') return record;
    return this.state.transition(actor, id, 'in_progress' as never);
  }

  async save(actor: CaseActor, id: string, body: unknown) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    const first = await db.$transaction(tx => lockedCase(tx, actor, id));
    const code = service(first), config = REPORT_SERVICE_CONFIG[code];
    if (first.status === 'advocate_accepted') await this.state.transition(actor, id, 'in_progress' as never);
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, id, code);
      if (record.status !== 'in_progress' && !await reportCorrectionAllowed(tx,record) || record.sub_status === REPORT_AWAITING_APPROVAL)
        throw new ConflictException('The submitted report is frozen while awaiting admin review.');
      const last = await tx.draft.findFirst({where: {case_id: id, kind: DRAFT_KIND}, orderBy: {version: 'desc'}});
      let content: ReportDraftContent;
      if (code==='property_search' && (body as {production?:string})?.production==='property') {
        const input=parse(PropertyReportSaveSchema,body);
        if((last?.id??null)!==input.base_draft_id)throw new ConflictException('A newer report version was saved in another session. Reload before continuing.');
        content={production:'property',report:input.report,note:input.note};
      } else if (config.production === 'upload') {
        const input = parse(UploadReportSaveSchema, body);
        if ((last?.id ?? null) !== input.base_draft_id) throw new ConflictException('A newer report version was saved in another session. Reload before continuing.');
        const doc = await tx.document.findFirst({where: {id: input.report_document_id, case_id: id, status: 'uploaded', kind: 'service_report', owner_id: actor.id}});
        if (!doc) throw new BadRequestException('Upload the final report PDF for this case first.');
        if (doc.mime_type !== 'application/pdf') throw new BadRequestException('The final report must be a PDF.');
        content = {production: 'upload', report_document_id: doc.id, note: input.note};
      } else {
        const input = parse(ForensicReportSaveSchema, body);
        if ((last?.id ?? null) !== input.base_draft_id) throw new ConflictException('A newer report version was saved in another session. Reload before continuing.');
        const previous = last?.content as ReportDraftContent | undefined;
        const keepSignature = last?.created_by===actor.id && previous?.production === 'forensic' && previous.signed_at &&
          JSON.stringify(previous.affidavit) === JSON.stringify(input.affidavit) && JSON.stringify(previous.report) === JSON.stringify(input.report) && JSON.stringify(previous.signature)===JSON.stringify(input.signature) && previous.typed_signature===input.typed_signature;
        // Any change to the sworn content requires signing again.
        content = {production: 'forensic', report: input.report, affidavit: input.affidavit, signature:input.signature, typed_signature:input.typed_signature, note: input.note,
          signed_at: input.signed ? (keepSignature ? (previous as {signed_at: string}).signed_at : new Date().toISOString()) : null};
      }
      const draft = await tx.draft.create({data: {case_id: id, kind: DRAFT_KIND, version: (last?.version ?? 0) + 1,
        content: content as unknown as Prisma.InputJsonObject, created_by: actor.id, generated_by: 'manual'}});
      await writeReportSaved(tx, actor, id, code, draft);
      return {id: draft.id, version: draft.version, content};
    });
  }

  private async submittable(actor: CaseActor, id: string, draftId: string) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, id);
      const code = service(record);
      if (record.status !== 'in_progress' && !await reportCorrectionAllowed(tx,record) || record.sub_status === REPORT_AWAITING_APPROVAL)
        throw new ConflictException('This report cannot be submitted in the current state.');
      const draft = await tx.draft.findFirst({where: {case_id: id, kind: DRAFT_KIND}, orderBy: {version: 'desc'}});
      if (!draft || draft.id !== draftId) throw new ConflictException('Refresh to use the latest report version.');
      if(draft.created_by!==actor.id)throw new ConflictException('Review the previous work and save your own report version before generating or submitting it.');
      if(record.status==='completed'&&await tx.caseEvent.findFirst({where:{case_id:id,type:'service_report_released',payload:{path:['draft_id'],equals:draftId}}}))throw new ConflictException('Save a new corrected version before sending it.');
      if (await tx.caseEvent.findFirst({where: {case_id: id, type: 'service_report_submitted', payload: {path: ['draft_id'], equals: draftId}}}))
        throw new ConflictException('Save a new corrected version before resubmitting. The earlier submission remains in the review history.');
      const content = draft.content as unknown as ReportDraftContent;
      if(isFlowReportService(code)){
        const workflow=await ensureReportWorkflow(tx,record);
        if(workflow.data.tasks?.some(t=>t.status!=='resolved'))throw new ConflictException('Resolve the outstanding information request before generating the report.');
        if(code==='document_forensic'&&!workflow.data.legacy_pending_submission){
          const checklist=workflow.data.checklist;
          const docs=await tx.document.findMany({where:{case_id:id,owner_id:record.client_id,status:'uploaded'},select:{id:true}});
          if(!checklist||docs.some(d=>!checklist.document_ids.includes(d.id)))throw new ConflictException('Complete the file checklist for all current documents.');
          if(content.production==='forensic'&&(!content.report.overall_status||!content.report.risk_level||!content.report.authenticity?.trim()))throw new BadRequestException('Complete the overall result, risk level and authenticity summary.');
        }
      }
      if (content.production === 'upload' && !await tx.document.findFirst({where: {id: content.report_document_id, case_id: id, status: 'uploaded'}}))
        throw new ConflictException('The uploaded report is no longer available. Upload it again and save.');
      const questioned = await tx.document.findFirst({where: {case_id: id, kind: 'questioned_document', status: 'uploaded'}});
      const client = await tx.user.findUniqueOrThrow({where: {id: record.client_id}, select: {full_name: true}});
      return {record, code, draft, content, questioned, client};
    });
  }

  private async render(input: Awaited<ReturnType<ServiceReportsService['submittable']>>,reportOnly=false) {
    if(input.content.production==='property'){
      try{return [{filename:'Property_Search_Report.pdf',kind:'service_report',bytes:await renderPropertyPdf({reference:input.record.reference,intake:input.record.details,report:input.content.report,generatedAt:input.draft.created_at})}];}
      catch(e){throw new BadRequestException(e instanceof Error?e.message:'Unable to render the report');}
    }
    if (input.content.production !== 'forensic') throw new BadRequestException('Open the uploaded report to preview it.');
    const details = input.record.details as {document_type?: string};
    try {
      return await renderForensicPdfs({reference: input.record.reference, client: input.client.full_name,
        documentName: 'Document submitted for examination', documentType: labelOf(FORENSIC_DOCUMENT_TYPES, details.document_type),
        report: input.content.report, affidavit: input.content.affidavit, signature:input.content.signature, typedSignature:input.content.typed_signature, signedAt: input.content.signed_at, generatedAt: input.draft.created_at},reportOnly);
    } catch (e) { throw new BadRequestException(e instanceof Error ? e.message : 'Unable to render the report'); }
  }

  async preview(actor: CaseActor, id: string, draftId: string,reportOnly=false) {
    const input=await this.submittable(actor,id,draftId);
    if(input.content.production==='property'&&!input.content.report.personally_checked)throw new BadRequestException('Confirm that you personally checked the records before generating the PDF.');
    const files = await this.render(input,reportOnly);
    return {files: await Promise.all(files.map(async f => ({filename: f.filename, pdf_base64: Buffer.from(f.bytes).toString('base64'),page_count:(await PDFDocument.load(f.bytes)).getPageCount(),size_bytes:String(f.bytes.length)})))};
  }

  async submit(actor: CaseActor, id: string, draftId: string) {
    const input = await this.submittable(actor, id, draftId);
    if(input.content.production==='property'&&!input.content.report.personally_checked)throw new BadRequestException('Confirm that you personally checked the report before sending it.');
    const config = REPORT_SERVICE_CONFIG[input.code];
    const created: string[] = [];
    try {
      let documentIds: string[];
      if (input.content.production !== 'upload') {
        documentIds = [];
        for (const file of await this.render(input)) {
          const ticket = await this.documents.presign(actor, {case_id: id, kind: file.kind, filename: file.filename, mime: 'application/pdf'}, {serviceReport:true});
          created.push(ticket.document.id);
          const form = new FormData();
          for (const [key, value] of Object.entries(ticket.upload.fields)) form.append(key, value as string);
          form.append('file', new Blob([Buffer.from(file.bytes)], {type: 'application/pdf'}), ticket.document.filename);
          const response = await fetch(ticket.upload.url, {method: 'POST', body: form});
          if (!response.ok) throw new ConflictException('Report upload failed. Retry submitting.');
          await this.documents.complete(actor, ticket.document.id);
          documentIds.push(ticket.document.id);
        }
      } else documentIds = [input.content.report_document_id];
      const db = await this.prisma.getClient();
      return await db.$transaction(async tx => {
        const record = await lockedCase(tx, actor, id, input.code);
        const latest = await tx.draft.findFirst({where: {case_id: id, kind: DRAFT_KIND}, orderBy: {version: 'desc'}});
        if (record.status !== 'in_progress' && !await reportCorrectionAllowed(tx,record) || record.sub_status === REPORT_AWAITING_APPROVAL || latest?.id !== draftId)
          throw new ConflictException('The case changed. Refresh; only one submitted version may await review.');
        if (await tx.document.count({where: {id: {in: documentIds}, case_id: id, status: 'uploaded'}}) !== documentIds.length)
          throw new ConflictException('A report file changed. Refresh and try again.');
        await tx.draft.update({where: {id: draftId}, data: {document_id: documentIds[0]}});
        const payload = {draft_id: draftId, version: input.draft.version, document_ids: documentIds};
        if (config.requiresAdminApproval) {
          const updated = await writeReportSubmitted(tx, actor, id, input.code, payload);
          for (const admin of await tx.user.findMany({where: {role: 'admin', status: 'active'}, select: {id: true}}))
            await this.notifications.send(tx, {user_id: admin.id, case_id: id, kind: 'report_review_needed', title: `${config.reportNoun} awaiting admin review`, body: record.reference});
          return updated;
        }
        const updated = await writeReportReleased(tx, actor, id, input.code, {...payload, note: input.content.note}, new Date(), false);
        await this.notifications.send(tx, {user_id: record.client_id, case_id: id, kind: 'report_ready', title: `Your ${config.reportNoun} is ready`, body: record.reference});
        return updated;
      });
    } catch (error) {
      // Unlinked rendered files never become visible to anyone as a submission.
      for (const doc of created) await this.documents.delete(actor, doc).catch(() => undefined);
      throw error;
    }
  }

  private async submitted(tx: Prisma.TransactionClient, id: string, draftId: string) {
    const sent = await tx.caseEvent.findFirst({where: {case_id: id, type: 'service_report_submitted'}, orderBy: {id: 'desc'}});
    const payload = sent?.payload as {draft_id: string; version: number; document_ids: string[]} | undefined;
    if (!payload || payload.draft_id !== draftId) throw new ConflictException('Refresh to review the submitted report.');
    return payload;
  }

  async approve(actor: CaseActor, id: string, draftId: string) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin approval required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, id);
      const code = service(record), config = REPORT_SERVICE_CONFIG[code];
      const payload = await this.submitted(tx, id, draftId);
      if (record.status === 'completed' && await tx.draftReview.findFirst({where: {draft_id: draftId, decision: 'approved'}})) return record;
      if (record.status !== 'in_progress' || record.sub_status !== REPORT_AWAITING_APPROVAL) throw new ConflictException('This case is not awaiting admin review');
      if (await tx.document.count({where: {id: {in: payload.document_ids}, case_id: id, status: 'uploaded'}}) !== payload.document_ids.length)
        throw new ConflictException('A submitted file is unavailable. Reload the case; approval cannot continue.');
      const draft = await tx.draft.findUniqueOrThrow({where: {id: draftId}});
      if(code==='document_forensic'){
        const workflow=await ensureReportWorkflow(tx,record);
        if(workflow.data.review_checklist?.draft_id!==draftId)throw new ConflictException('Complete the four review checks for this submitted version before approval.');
      }
      const now = new Date();
      await tx.draftReview.create({data: {draft_id: draftId, reviewer_id: actor.id, decision: 'approved', created_at: now}});
      const updated = await writeReportReleased(tx, actor, id, code, {...payload, note: (draft.content as {note?: string}).note ?? ''}, now, true);
      await tx.adminAction.create({data: {admin_id: actor.id, action: 'approve_service_report', subject_type: 'case', subject_id: id, payload}});
      await this.notifications.send(tx, {user_id: record.client_id, case_id: id, kind: 'report_ready', title: `Your ${config.reportNoun} is ready`, body: record.reference});
      if (record.advocate_id) await this.notifications.send(tx, {user_id: record.advocate_id, case_id: id, kind: 'report_approved', title: 'Admin approved your report', body: record.reference});
      return updated;
    });
  }

  async requestChanges(actor: CaseActor, id: string, draftId: string, body: unknown) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin review required');
    const {items} = parse(ChangeItemsSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, id);
      const code = service(record);
      if (!REPORT_SERVICE_CONFIG[code].requiresAdminApproval) throw new NotFoundException('Case not found');
      const payload = await this.submitted(tx, id, draftId);
      await tx.draftReview.create({data: {draft_id: draftId, reviewer_id: actor.id, decision: 'changes_requested',
        comment: items.map((i, n) => `${n + 1}. ${i.title}${i.detail ? ` — ${i.detail}` : ''}`).join('\n')}});
      const updated = await writeReportChangesRequested(tx, actor, id, code, {draft_id: draftId, version: payload.version, items});
      if(code==='document_forensic'){
        const w=await ensureReportWorkflow(tx,record);
        await tx.reportWorkflow.update({where:{case_id:id},data:{revision:{increment:1},data:{...w.data,phase:'waiting',review_checklist:undefined,legacy_pending_submission:false} as Prisma.InputJsonObject}});
      }
      await tx.adminAction.create({data: {admin_id: actor.id, action: 'request_report_changes', subject_type: 'case', subject_id: id, payload: {draft_id: draftId, items}}});
      if (record.advocate_id) await this.notifications.send(tx, {user_id: record.advocate_id, case_id: id, kind: 'report_changes_requested', title: 'Admin asked for changes', body: record.reference});
      return updated;
    });
  }
}

export const reportBreakdown = (snapshot: unknown) => (snapshot as {breakdown?: QuoteBreakdown} | undefined)?.breakdown ?? null;
export const propertyTypeLabel = (code?: string | null) => labelOf(PROPERTY_TYPES, code);
