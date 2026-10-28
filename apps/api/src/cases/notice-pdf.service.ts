import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { NoticeDraftInputSchema } from '@legalitt/shared';
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
    if (!Object.values(content).some(v => v.trim())) throw new BadRequestException('Enter the draft before sending it');
    const bytes = await renderNoticePdf({ reference: record.reference, date: new Date(), place: await this.place(record.advocate_id), content });
    const document = await this.file(actor, caseId, `Legal_Notice_Draft_v${draft.version}.pdf`, bytes);
    const db = await this.prisma.getClient();
    await db.draft.update({ where: { id: draftId }, data: { document_id: document.id } });
    return document;
  }

  /** Legal_Notice_Final.pdf: the approved draft, dated on approval. The approval
   * itself is recorded on the case (design 192's "Signed by Client" is the app's
   * descriptor of this file), never printed in a letter that goes to the other party. */
  async final(actor: CaseActor, caseId: string, draftId: string, approvedAt: Date) {
    if (actor.role !== 'client') throw new ForbiddenException('Case client required');
    const { record, content } = await this.load(actor, caseId, draftId);
    if (record.status !== 'client_review') throw new ConflictException('Invalid case transition');
    const bytes = await renderNoticePdf({ reference: record.reference, date: approvedAt, place: await this.place(record.advocate_id), content });
    return this.file(actor, caseId, 'Legal_Notice_Final.pdf', bytes);
  }

  /** Undo a filing whose lifecycle step then failed: the document is deleted and no draft points at it. */
  async discard(actor: CaseActor, documentId: string) {
    try {
      const db = await this.prisma.getClient();
      await db.draft.updateMany({ where: { document_id: documentId }, data: { document_id: null } });
      await this.documents.delete(actor, documentId);
    } catch {
      this.logger.warn(`Notice PDF ${documentId} could not be discarded; cleanup will not retry an uploaded file`);
    }
  }

  private async load(actor: CaseActor, caseId: string, draftId: string) {
    const db = await this.prisma.getClient();
    const record = await db.case.findFirst({ where: { AND: [caseScope(actor), { id: caseId }] } });
    if (!record) throw new ConflictException('Case not found');
    const draft = await db.draft.findFirst({ where: { case_id: caseId, kind: 'legal_notice' }, orderBy: { version: 'desc' } });
    if (!draft || draft.id !== draftId) throw new ConflictException('Refresh to use the latest draft');
    return { record, draft, content: parse(NoticeDraftInputSchema.shape.content, draft.content) };
  }
  private async place(advocateId: string | null) {
    if (!advocateId) return null;
    const db = await this.prisma.getClient();
    return (await db.advocateProfile.findUnique({ where: { user_id: advocateId }, select: { city: true } }))?.city ?? null;
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
