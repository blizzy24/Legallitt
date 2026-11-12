import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  documentMaxBytes, MEDIA_MIMES, FIR_MEDIA_KINDS, FIR_UPLOAD_SLOTS, FIR_CHANGE_ATTACHMENT_KIND, FIR_POLICE_RECEIPT_KIND, FIR_CUSTOM_SLOT_KIND, FIR_CHANGE_ATTACHMENT_MAX_BYTES,
  DOCUMENT_URL_SECONDS,
  DocumentMimeSchema,
  DocumentPresignSchema,
  ID_PROOF_NOTICE,
  FIR_ID_NOTICE,
  IdentityEvidenceSchema,
} from "@legalitt/shared";
import type { Prisma, Document } from "../generated/prisma/client";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import { caseScope, type CaseActor } from "../cases/case-access";
import { appendCaseEvent, lockedCase } from "../cases/case-state-machine";
import { DocumentStorage, stagingKey } from "./document-storage";
import { FileInspector } from "./file-inspector";
import {firIdentityPolicy} from './fir-identity';
import {isConsultationService} from '@legalitt/shared';
import {consultationDocumentVisible} from '../consultations/consultation-documents';
import {assertReportDocumentDeletable,assertReportDocumentReadable,assertReportUploadAllowed} from '../service-reports/report-access';

const transactionOptions = { timeout: 60_000 };
@Injectable()
export class DocumentService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private cleanupRunning = false;
  private readonly logger = new Logger(DocumentService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: DocumentStorage,
    private readonly inspector: FileInspector,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.cleanupAbandoned().catch(() =>
        this.logger.warn("Document cleanup failed; will retry"),
      );
    }, 300_000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async locked(
    tx: Prisma.TransactionClient,
    actor: CaseActor,
    id: string,
  ) {
    const scope = caseScope(actor);
    const locked = await tx.$queryRaw<{id: string}[]>`SELECT d.id FROM documents d JOIN cases c ON c.id = d.case_id
      WHERE d.id = ${id}::uuid
      AND (${actor.role} = 'admin'
        OR (${actor.role} = 'client' AND c.client_id = ${actor.id}::uuid)
        OR (${actor.role} = 'advocate' AND c.advocate_id = ${actor.id}::uuid))
      FOR UPDATE OF d, c`;
    if (!locked.length) throw new NotFoundException("Document not found");
    const doc = await tx.document.findFirst({
      where: { id, case_id_relation: { is: scope } },
    });
    if (!doc) throw new NotFoundException("Document not found");
    return doc;
  }
  private publicRecord(doc: Document) {
    return {
      ...doc,
      size_bytes: doc.size_bytes.toString(),
      ...(doc.kind === "id_proof" ? { identity_notice: doc.identity_evidence ? FIR_ID_NOTICE : ID_PROOF_NOTICE } : {}),
    };
  }
  async presign(actor: CaseActor, body: unknown, internal?:{consultationReport?:boolean;serviceReport?:boolean}) {
    const input = parse(DocumentPresignSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, input.case_id);
      if(input.kind==='consultation_report'&&(!internal?.consultationReport||actor.role!=='advocate'||!isConsultationService(record.service_code)))
        throw new BadRequestException('Consultation briefs must be generated from the report editor.');
      if(isConsultationService(record.service_code)&&['completed','cancelled','refunded'].includes(record.status))throw new ConflictException('This case is closed; documents cannot be added.');
      const replacingIdentity=record.service_code==='fir_draft'&&['assigned','advocate_accepted','in_progress','changes_requested'].includes(record.status)&&actor.role==='client'&&input.kind==='id_proof'&&!!await tx.firIdentityReturn.findFirst({where:{case_id:record.id,state:'replacement_required'}});
      const firSpecial=[FIR_CHANGE_ATTACHMENT_KIND,FIR_POLICE_RECEIPT_KIND].includes(input.kind);
      if (record.service_code === 'fir_draft' && !(
        replacingIdentity || actor.role === 'client' && ['draft','payment_pending'].includes(record.status) && !firSpecial && input.kind !== 'fir_draft' ||
        // C12: one optional attachment with a client change request.
        actor.role === 'client' && record.status === 'client_review' && input.kind === FIR_CHANGE_ATTACHMENT_KIND ||
        // C14: the police receipt, once the client has approved.
        actor.role === 'advocate' && record.status === 'approved' && input.kind === FIR_POLICE_RECEIPT_KIND ||
        actor.role === 'advocate' && ['advocate_accepted','in_progress','changes_requested'].includes(record.status) && record.sub_status!=='awaiting_admin_approval' && !firSpecial
      )) throw new ConflictException('FIR documents are frozen at this stage');
      // Video and audio are accepted only in the FIR slots drawn for them (flow C6).
      if (MEDIA_MIMES.includes(input.mime) && !(record.service_code === 'fir_draft' && FIR_MEDIA_KINDS[input.kind]?.includes(input.mime)))
        throw new BadRequestException('Upload a PDF, JPEG or PNG file.');
      // Design 45 slots: each takes only its drawn file types and holds a bounded number of files.
      const slot = record.service_code === 'fir_draft' ? FIR_UPLOAD_SLOTS.find(s => s.kind === input.kind) : undefined;
      if (slot && !(slot.accept as readonly string[]).includes(input.mime))
        throw new BadRequestException(`${slot.title} doesn’t accept this file type.`);
      if (slot && await tx.document.count({where: {case_id: record.id, kind: slot.kind, status: 'uploaded'}}) >= slot.max)
        throw new BadRequestException(`${slot.title} holds up to ${slot.max} files. Remove one to add another.`);
      if (input.kind === FIR_CUSTOM_SLOT_KIND && (record.service_code !== 'fir_draft' || !input.slot_label))
        throw new BadRequestException('Name the custom category before uploading.');
      if (input.identity_last4 && (record.service_code !== 'fir_draft' || input.kind !== 'id_proof'))
        throw new BadRequestException('Identity digits belong only to FIR identity uploads');
      if (record.service_code === 'fir_draft' && input.kind === 'id_proof' && !input.identity_last4)
        throw new BadRequestException('Enter the last four digits of the identity document.');
      assertReportUploadAllowed(actor, record, input.kind, internal?.serviceReport);
      const id = randomUUID();
      if(input.identity&&(record.service_code!=='fir_draft'||input.kind!=='id_proof'))throw new BadRequestException('Identity declarations belong only to FIR identity uploads');
      let identity:ReturnType<typeof IdentityEvidenceSchema.parse>|undefined;
      if(record.service_code==='fir_draft'&&input.kind==='id_proof'){
        const policy=await firIdentityPolicy(tx),type=policy.accepted_documents.find(t=>t.code===input.identity?.document_type);
        if(!input.identity||!type)throw new BadRequestException('Choose one accepted identity document type before uploading.');
        if(type.requires_masking&&!input.identity.masked_copy)throw new BadRequestException('Full Aadhaar is not accepted. Download and confirm a masked copy showing only the last four digits.');
        identity={...input.identity,policy_version:policy.version,declared_at:new Date().toISOString()};
      }
      // Original identity filenames may contain ID numbers. Never persist them,
      // including in object keys, download headers, the draft or PDF manifest.
      const filename=input.kind==='id_proof'?`Identity-proof-${id}.${input.mime==='application/pdf'?'pdf':input.mime==='image/png'?'png':'jpg'}`:input.filename;
      const key = `cases/${input.case_id}/${id}/${filename}`;
      const doc = await tx.document.create({
        data: {
          id,
          case_id: input.case_id,
          owner_id: actor.id,
          simulated: actor.source === "simulated",
          kind: input.kind,
          filename,
          ...(identity?{identity_evidence:identity}:{}),
          ...(input.identity_last4?{identity_last4:input.identity_last4}:{}),
          ...(input.kind===FIR_CUSTOM_SLOT_KIND&&input.slot_label?{slot_label:input.slot_label}:{}),
          s3_key: key,
          mime_type: input.mime,
          size_bytes: 0n,
          status: "pending",
        },
      });
      const upload = await this.storage.upload(key, input.mime, documentMaxBytes(input.mime, input.kind));
      return {
        document: this.publicRecord(doc),
        ...(doc.simulated ? {simulated: true} : {}),
        upload: {
          ...upload,
          method: "POST",
          expires_in: DOCUMENT_URL_SECONDS,
          max_bytes: documentMaxBytes(input.mime, input.kind),
        },
      };
    }, transactionOptions);
  }
  async complete(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const doc = await this.locked(tx, actor, id);
      if (doc.status === "uploaded") return this.publicRecord(doc);
      const record = await tx.case.findUniqueOrThrow({where:{id:doc.case_id!}});
      assertReportUploadAllowed(actor, record, doc.kind, true);
      if(!await consultationDocumentVisible(tx,actor,record,doc))throw new NotFoundException('Document not found');
      if (record.service_code === 'fir_draft' && (record.sub_status === 'awaiting_admin_approval' || record.status === 'completed'))
        throw new ConflictException('FIR documents are frozen at this stage');
      if (doc.status !== "pending")
        throw new NotFoundException("Document not found");
      // Two uploads started together cannot both land in a full slot (the case row is locked).
      const slot = record.service_code === 'fir_draft' ? FIR_UPLOAD_SLOTS.find(s => s.kind === doc.kind) : undefined;
      if (slot && await tx.document.count({where: {case_id: record.id, kind: slot.kind, status: 'uploaded'}}) >= slot.max)
        throw new BadRequestException(`${slot.title} holds up to ${slot.max} files. Remove one to add another.`);
      const key = stagingKey(doc.s3_key);
      const info = await this.storage.head(key);
      if (!info)
        throw new ConflictException("Upload is not present in storage");
      try {
        if (
          !DocumentMimeSchema.safeParse(info.mime).success ||
          info.size < 1 ||
          info.size > documentMaxBytes(info.mime, doc.kind) ||
          (doc.kind === FIR_CHANGE_ATTACHMENT_KIND && info.size > FIR_CHANGE_ATTACHMENT_MAX_BYTES)
        )
          throw new BadRequestException(
            "File exceeds the upload limits or has an unsupported type",
          );
        const bytes = await this.storage.read(key, info, documentMaxBytes(info.mime, doc.kind));
        const actual = await this.inspector.inspect(bytes);
        if (actual.mime !== info.mime)
          throw new BadRequestException(
            "File type does not match its storage metadata",
          );
        await this.storage.promote(doc.s3_key, info, actual.mime);
        const updated = await tx.document.update({
          where: { id },
          data: {
            mime_type: actual.mime,
            size_bytes: BigInt(info.size),
            page_count: actual.pageCount,
            status: "uploaded",
          },
        });
        return this.publicRecord(updated);
      } catch (error) {
        // Invalid content stays unavailable. Delete only the inspected version so
        // a concurrent retry is not removed. No raw file/error contents are logged.
        if (error instanceof BadRequestException)
          await this.storage.discard(key, info);
        throw error;
      }
    }, transactionOptions);
  }
  async url(actor: CaseActor, id: string, preview = false) {
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const doc = await this.locked(tx, actor, id);
      if (doc.status !== "uploaded")
        throw new NotFoundException("Document not found");
      const record = await tx.case.findUniqueOrThrow({where:{id:doc.case_id!}});
      if(!await consultationDocumentVisible(tx,actor,record,doc))throw new NotFoundException('Document not found');
      // A2: earlier draft PDFs print the client's contact details; they open once the advocate accepts.
      if (record.service_code === 'fir_draft' && actor.role === 'advocate' && record.status === 'assigned' && doc.kind === 'fir_draft')
        throw new NotFoundException('Document not found');
      if (record.service_code === 'fir_draft' && actor.role === 'client' && doc.owner_id !== record.client_id) {
        // The client sees a draft PDF once the admin approved it (sent to client),
        // and the advocate's police receipt (C14). Nothing else the team uploaded.
        const approved = doc.kind === 'fir_draft' && await tx.draft.findFirst({where:{case_id:record.id,document_id:doc.id,
          draft_reviews_draft_id_relations:{some:{decision:'approved',reviewer_id_relation:{role:'admin'}}}}});
        const receipt = doc.kind === FIR_POLICE_RECEIPT_KIND && await tx.firPoliceSubmission.findFirst({where:{case_id:record.id,receipt_document_id:doc.id}});
        if (['cancelled','refunded'].includes(record.status) || !(approved || receipt)) throw new NotFoundException('Document not found');
      }
      await assertReportDocumentReadable(tx, actor, record, doc);
      if (record.service_code === 'fir_draft' && actor.role === 'client' && doc.kind === 'fir_draft' && record.status === 'client_review') {
        // A6 audit log: "Client viewed the draft", once per draft version. The case row
        // is locked above, so two concurrent opens cannot both append it.
        const draft = await tx.draft.findFirst({where:{case_id:record.id,document_id:doc.id},select:{id:true,version:true}});
        const seen = draft && (await tx.caseEvent.findMany({where:{case_id:record.id,type:'fir_client_viewed'},select:{payload:true}}))
          .some(e => (e.payload as {draft_id?: string} | null)?.draft_id === draft.id);
        if (draft && !seen)
          await appendCaseEvent(tx, {case_id:record.id,type:'fir_client_viewed',actor_id:actor.id,actor_role:actor.role,payload:{version:draft.version,draft_id:draft.id}});
      }
      return {
        url: await this.storage.download(doc.s3_key, doc.filename,
          preview && actor.role === 'admin' && ['application/pdf', 'image/png', 'image/jpeg'].includes(doc.mime_type)),
        ...(doc.simulated ? {simulated: true} : {}),
        expires_in: DOCUMENT_URL_SECONDS,
      };
    }, transactionOptions);
  }
  async delete(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    const doc = await db.$transaction(async (tx) => {
      const record = await this.locked(tx, actor, id);
      const parent = await tx.case.findUniqueOrThrow({where:{id:record.case_id!}});
      if(isConsultationService(parent.service_code)){
        const reports=await tx.consultationReport.findMany({where:{case_id:parent.id,status:{in:['submitted','approved']}}});
        if(reports.some(r=>r.document_id===id||((r.content as {attachment_ids?:string[]}).attachment_ids??[]).includes(id))||await tx.courtProgress.findFirst({where:{case_id:parent.id,document_ids:{has:id}}}))
          throw new ConflictException('Published or submitted case documents are retained with their report.');
      }
      if (parent.service_code === 'fir_draft') {
        if(record.kind==='id_proof'&&!['draft','payment_pending'].includes(parent.status))throw new ConflictException('Use the admin identity review to replace submitted identity evidence.');
        const linked = await tx.draft.findFirst({where:{case_id:parent.id,document_id:id}}) ||
          await tx.draftReview.findFirst({where:{attachment_document_id:id}}) ||
          await tx.firPoliceSubmission.findFirst({where:{receipt_document_id:id}});
        // Evidence in a submitted or approved dossier is frozen. An unused change
        // attachment or a mistaken receipt upload stays removable until it is linked.
        if (linked || ((parent.sub_status === 'awaiting_admin_approval' || ['client_review','approved','completed'].includes(parent.status)) &&
          !['fir_draft', FIR_CHANGE_ATTACHMENT_KIND, FIR_POLICE_RECEIPT_KIND].includes(record.kind)))
          throw new ConflictException('Submitted FIR documents cannot be deleted');
      }
      await assertReportDocumentDeletable(tx, parent, record);
      if (actor.role !== "admin" && record.owner_id !== actor.id)
        throw new ForbiddenException(
          "Only the uploader or admin may delete evidence",
        );
      // Tombstone first: if S3 is unavailable, new downloads are still blocked
      // and the scheduled sweep retries physical deletion. Preserve FK history.
      return tx.document.update({ where: { id }, data: { status: "deleted" } });
    }, transactionOptions);
    try {
      await this.purge(doc);
    } catch {
      this.logger.warn("Document deletion will be retried by cleanup");
    }
    return { deleted: true };
  }
  private async purge(doc: Document) {
    const db=await this.prisma.getClient();
    try{await this.storage.remove(doc.s3_key);await this.storage.remove(stagingKey(doc.s3_key));}
    catch(error){await db.firIdentityReturn.updateMany({where:{document_id:doc.id},data:{purge_status:'failed',purge_attempted_at:new Date()}});throw error;}
    await db.firIdentityReturn.updateMany({where:{document_id:doc.id},data:{purge_attempted_at:new Date(),purge_status:'pending'}});
    await db.firIdentityReturn.updateMany({where:{document_id:doc.id,purge_after:{lte:new Date()}},data:{purge_status:'complete'}});
  }
  async purgeRejectedIdentity(id:string){
    const db=await this.prisma.getClient(),doc=await db.document.findUnique({where:{id}});
    if(!doc||doc.status!=='deleted'||!await db.firIdentityReturn.findUnique({where:{document_id:id}}))throw new ConflictException('No rejected identity document to purge');
    try{await this.purge(doc);}catch{await db.firIdentityReturn.update({where:{document_id:id},data:{purge_status:'failed',purge_attempted_at:new Date()}});}
  }
  async cleanupAbandoned(now = new Date()) {
    if (this.cleanupRunning) return;
    this.cleanupRunning = true;
    try {
      const db = await this.prisma.getClient();
      const cutoff = new Date(now.getTime() - 3_600_000);
      let cursor: string | undefined;
      for (;;) {
        const rows = await db.document.findMany({
          where: {
            ...(cursor ? { id: { gt: cursor } } : {}),
            OR: [
              { status: "pending", created_at: { lt: cutoff } },
              { status: "uploaded", created_at: { lt: cutoff } },
              { status: "deleted" },
            ],
          },
          orderBy: { id: "asc" },
          take: 100,
        });
        if (!rows.length) break;
        for (const row of rows) {
          await db.$transaction(async (tx) => {
            const locks = await tx.$queryRaw<
              { id: string }[]
            >`SELECT id FROM documents WHERE id = ${row.id}::uuid FOR UPDATE SKIP LOCKED`;
            if (!locks.length) return;
            const current = await tx.document.findUnique({
              where: { id: row.id },
            });
            if (!current) return;
            if (current.status === "pending" && current.created_at < cutoff) {
              if (
                !(await this.storage.head(stagingKey(current.s3_key))) &&
                !(await this.storage.head(current.s3_key))
              )
                await tx.document.delete({ where: { id: current.id } });
            } else if (
              current.status === "uploaded" &&
              current.created_at < cutoff
            ) {
              // Upload URLs expired long ago; discard superseded temporary versions.
              await this.storage.remove(stagingKey(current.s3_key));
            } else if (current.status === "deleted") await this.purge(current);
          }, transactionOptions);
        }
        cursor = rows.at(-1)!.id;
        if (rows.length < 100) break;
      }
    } finally {
      this.cleanupRunning = false;
    }
  }
}
