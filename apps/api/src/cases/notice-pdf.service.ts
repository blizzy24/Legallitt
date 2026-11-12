import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NoticeDraftInputSchema, NoticePolicySchema, noticeClosing, noticePdfProblem, type LegalNoticeIntake, type LegalDemand } from '@legalitt/shared';
import { parse } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';
import { DocumentService } from '../documents/document.service';
import { renderNoticePdf } from '../documents/notice-pdf';
import { caseScope, type CaseActor } from './case-access';

// Renders the notice from the advocate's draft and files it through the real
// documents pipeline (presign, S3 upload, complete) as the acting user, so the
// page count and every validation come from the real file. This is real
// generation, not a simulator (§2.11): nothing stands in for anything.
@Injectable()
export class NoticePdfService {
  private readonly logger = new Logger(NoticePdfService.name);
  constructor(private readonly prisma: PrismaService, private readonly documents: DocumentService) {}

  /** Legal_Notice_Draft_v{version}.pdf for the draft about to go to the client; linked on the draft. */
  async draft(actor: CaseActor, caseId: string, draftId: string) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const { record, draft, content } = await this.load(actor, caseId, draftId);
    if (record.status !== 'in_progress') throw new ConflictException('Draft cannot be sent in this state');
    const bytes = await renderNoticePdf(this.template(record, content, draft.created_at, draft));
    const document = await this.file(actor, caseId, `Legal_Notice_Draft_v${draft.version}.pdf`, bytes);
    // The state writer links this PDF atomically with send. A competing send
    // must never replace a published version's document before checking state.
    return document;
  }

  /** Legal_Notice_Final.pdf: the approved draft, dated on approval. The approval
   * itself is recorded on the case (design 192's "Signed by Client" is the app's
   * descriptor of this file), never printed in a letter that goes to the other party. */
  async final(actor: CaseActor, caseId: string, draftId: string, approvedAt: Date) {
    if (actor.role !== 'client') throw new ForbiddenException('Case client required');
    const { record, draft, content } = await this.load(actor, caseId, draftId);
    if (record.status !== 'client_review') throw new ConflictException('Invalid case transition');
    const bytes = await renderNoticePdf(this.template(record, content, approvedAt, draft));
    return this.file(actor, caseId, 'Legal_Notice_Final.pdf', bytes);
  }

  /** Undo a filing whose lifecycle step then failed: the document is deleted and no draft points at it. */
  async discard(actor: CaseActor, documentId: string) {
    try {
      await this.documents.delete(actor, documentId);
    } catch {
      this.logger.warn(`Notice PDF ${documentId} could not be discarded; cleanup will not retry an uploaded file`);
    }
  }

  private async load(actor: CaseActor, caseId: string, draftId: string) {
    const db = await this.prisma.getClient();
    const record = await db.case.findFirst({ where: { AND: [caseScope(actor, 'legal_notice'), { id: caseId }] }, include: {
      case_parties_case_id_relations: true,
      pricing_id_relation: {select: {base_amount_paise: true}},
      advocate_id_relation: {select: {full_name: true, advocate_profiles_user_id_relations: {
        select: {education: true, bar_council_number: true, city: true},
      }}},
    }});
    if (!record) throw new NotFoundException('Case not found');
    const draft = await db.draft.findFirst({ where: { case_id: caseId, kind: 'legal_notice' }, orderBy: { version: 'desc' } });
    if (!draft || draft.id !== draftId) throw new ConflictException('Refresh to use the latest draft');
    return { record, draft, content: parse(NoticeDraftInputSchema.shape.content, draft.content) };
  }
  /** Render-only preview: no state transition and no unsent document exposed to
   * the client. Sending/approval continue to file through the real S3 pipeline. */
  async preview(actor: CaseActor, caseId: string, draftId: string) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const {record, draft, content} = await this.load(actor, caseId, draftId);
    if (record.status !== 'in_progress') throw new ConflictException('Draft cannot be generated in this state');
    const bytes = await renderNoticePdf(this.template(record, content, draft.created_at, draft));
    return {filename: `Legal_Notice_Draft_v${draft.version}.pdf`, pdf_base64: Buffer.from(bytes).toString('base64')};
  }

  private template(record: Awaited<ReturnType<NoticePdfService['load']>>['record'],
    content: Awaited<ReturnType<NoticePdfService['load']>>['content'], date: Date, draft: Awaited<ReturnType<NoticePdfService['load']>>['draft']) {
    const closingPolicy = parse(NoticePolicySchema, draft.closing_policy ?? {});
    const compliancePeriodDays = draft.compliance_period_days ?? null;
    try { noticeClosing(closingPolicy, compliancePeriodDays, content.offences); }
    catch (e) { throw new BadRequestException(e instanceof Error ? e.message : 'Invalid notice closing'); }
    const details = (record.details ?? {}) as LegalNoticeIntake;
    const sender = record.case_parties_case_id_relations.find(p => p.kind === 'sender');
    const advocate = record.advocate_id_relation;
    const profile = advocate?.advocate_profiles_user_id_relations;
    const demand = record.legal_demand as LegalDemand | null;
    const template = {reference: record.reference, date, content, compliancePeriodDays, closingPolicy, place: profile?.city,
      advocate: {name: advocate?.full_name, qualifications: profile?.education, enrolment: profile?.bar_council_number},
      sender: {name: details.client?.fullName, salutation: sender?.salutation, relation: sender?.relation, relative: sender?.relative_name, age: sender?.age, address: details.client?.address},
      recipient: {name: details.noticee?.fullName, address: details.noticee?.address},
      subject: record.subject_line,
      demands: [...(demand?.selected ?? []), ...(demand?.custom?.trim() ? [demand.custom.trim()] : [])],
      // This case's agreed base fee, never today's pricing row or the GST total.
      serviceFeePaise: record.pricing_id_relation?.base_amount_paise,
    };
    const problem = noticePdfProblem(template);
    if (problem) throw new BadRequestException(problem);
    return template;
  }
  private async file(actor: CaseActor, caseId: string, filename: string, bytes: Uint8Array) {
    const ticket = await this.documents.presign(actor, { case_id: caseId, kind: 'legal_notice', filename, mime: 'application/pdf' });
    const form = new FormData();
    for (const [key, value] of Object.entries(ticket.upload.fields)) form.append(key, value);
    form.append('file', new Blob([Buffer.from(bytes)], { type: 'application/pdf' }), filename);
    const upload = await fetch(ticket.upload.url, { method: 'POST', body: form });
    if (!upload.ok) throw new ConflictException(`Notice PDF could not be stored (HTTP ${upload.status})`);
    return this.documents.complete(actor, ticket.document.id);
  }
}
