import { ForbiddenException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { isReportService } from '@legalitt/shared';
import { ADMIN_CASE_BUCKETS, adminBucketFor, CaseStatus, SERVICE_CODES, type AdminCasePage, type AdminCaseRow } from '@legalitt/shared';
import { PrismaService } from '../prisma.service';
import { parse } from '../auth/auth.service';
import { caseScope, type CaseActor } from '../cases/case-access';
import type { Prisma } from '../generated/prisma/client';
import {firApproval} from '../cases/fir-approval';
import {FirPolicyConfig} from '../cases/fir-lifecycle';
import {isConsultationService} from '@legalitt/shared';

export const adminCaseQuerySchema = z.strictObject({
  service: z.enum(SERVICE_CODES).default('legal_notice'),
  bucket: z.enum(ADMIN_CASE_BUCKETS).optional(),
  search: z.string().trim().max(200).default(''),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().max(2048).optional(),
  queue: z.literal('approval').optional(),
});
const cursorSchema = z.strictObject({id: z.uuid(), created_at: z.iso.datetime(), scope: z.string()});
const eligible = Object.values(CaseStatus).filter(status => adminBucketFor(status) !== null);
const obj = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const name = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;

@Injectable()
export class AdminCasesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async list(actor: CaseActor, query: unknown): Promise<AdminCasePage> {
    // Authorisation remains in the data layer as well as the HTTP guard.
    if (actor.role !== 'admin') throw new ForbiddenException('Admin access required');
    const input = parse(adminCaseQuerySchema, query);
    const scope = JSON.stringify([input.service, input.bucket ?? null, input.search, input.queue ?? null]);
    let cursor: z.infer<typeof cursorSchema> | undefined;
    if (input.cursor) {
      let decoded: unknown;
      try { decoded = JSON.parse(Buffer.from(input.cursor, 'base64url').toString()); } catch { decoded = null; }
      cursor = parse(cursorSchema.refine(value => value.scope === scope), decoded);
    }
    const base: Prisma.CaseWhereInput = {AND: [
      caseScope(actor), {service_code: input.service, status: {in: eligible}},
      ...(input.search ? [{OR: [
        {reference: {contains: input.search, mode: 'insensitive' as const}},
        {client_id_relation: {is: {full_name: {contains: input.search, mode: 'insensitive' as const}}}},
        {matter_type: {contains: input.search.replace(/\s+/g, '_'), mode: 'insensitive' as const}},
      ]}] : []),
    ]};
    const consultation=isConsultationService(input.service);
    const report=isReportService(input.service);
    const waiting: Prisma.CaseWhereInput = consultation||report?{status:'in_progress',sub_status:'awaiting_admin_approval'}:{service_code:'fir_draft',OR:[{status:'in_progress',sub_status:'awaiting_admin_approval'},{status:{in:['assigned','advocate_accepted','in_progress','changes_requested']},sub_status:{in:['identity_review_pending','multiple_corrections_required']}}]};
    const ordinaryBucket:Prisma.CaseWhereInput={status:{in:eligible.filter(s=>adminBucketFor(s,input.service)===input.bucket)}};
    const bucketWhere: Prisma.CaseWhereInput = (consultation||report)&&input.bucket==='open'?{OR:[ordinaryBucket,waiting]}:(consultation||report)&&input.bucket==='in_progress'?{AND:[ordinaryBucket,{NOT:waiting}]}:ordinaryBucket;
    const filtered: Prisma.CaseWhereInput = {AND:[base,
      ...(input.bucket ? [input.service==='fir_draft'?{OR:eligible.flatMap(status=>[null,'awaiting_admin_approval','advocate_revision_required','identity_replacement_required','identity_review_pending','multiple_corrections_required'].filter(sub=>adminBucketFor(status,input.service,sub)===input.bucket).map(sub_status=>({status,sub_status})))}:bucketWhere] : []),
      ...(input.queue ? [waiting] : [])]};
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const policyRow=input.service==='fir_draft'?await tx.firPolicy.findFirst({orderBy:{version:'desc'},where:{effective_from:{lte:new Date()}}}):null;
      const defaultPolicy=policyRow?FirPolicyConfig.parse(policyRow.config):null;
      const grouped = await tx.case.groupBy({by: ['status','sub_status'], where: base, _count: {_all: true}});
      const approval_waiting = await tx.case.count({where:{AND:[base,waiting]}});
      const counts = {open: 0, pending: 0, in_progress: 0, completed: 0, closed: 0};
      for (const group of grouped) {
        const bucket = adminBucketFor(group.status as CaseStatus,input.service,group.sub_status);
        if (bucket) counts[bucket] += group._count._all;
      }
      const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
      const rows = await tx.case.findMany({
        where: {AND: [filtered, ...(cursor ? [{OR: [
          ...(input.queue ? [{updated_at:{gt:new Date(cursor.created_at)}},{updated_at:new Date(cursor.created_at),id:{gt:cursor.id}}] :
            [{created_at:{lt:new Date(cursor.created_at)}},{created_at:new Date(cursor.created_at),id:{lt:cursor.id}}]),
        ]}] : [])]},
        orderBy: input.queue ? [{updated_at:'asc'},{id:'asc'}] : [{created_at:'desc'},{id:'desc'}], take: input.limit + 1,
        select: {
          id: true, reference: true, service_code: true, status: true, matter_type: true, created_at: true,
          details: true, notice_document_id: true, sub_status:true, updated_at:true,
          fir_lifecycle:{include:{policy:true}},payments_case_id_relations:{where:{purpose:'service_fee',status:'captured'},orderBy:{captured_at:'asc'},take:1,select:{captured_at:true}},
          case_events_case_id_relations: {where: {OR:[{source:'simulated'},{type:{in:['fir_draft_submitted','fir_draft_approved']}}]}, select: {id:true,type:true,payload:true,created_at:true,source:true}},
          client_id_relation: {select: {id: true, full_name: true}},
          advocate_id_relation: {select: {id: true, full_name: true}},
          pricing_id_relation: {select: {base_amount_paise: true}},
          case_parties_case_id_relations: {select: {kind: true, name: true}},
          drafts_case_id_relations: {select: {document_id: true}},
          documents_case_id_relations: {where: {status: 'uploaded'}, select: {id: true, simulated: true, owner_id_relation: {select: {role: true}}}},
        },
      });
      const consultationIds=consultation?rows.map(r=>r.id):[];
      const sessions=consultation?await tx.consultation.findMany({where:{case_id:{in:consultationIds}}}):[];
      const pendingReports=consultation?await tx.consultationReport.findMany({where:{case_id:{in:consultationIds},status:'submitted'}}):[];
      const items: AdminCaseRow[] = rows.slice(0, input.limit).map(row => {
        const policy=row.fir_lifecycle?FirPolicyConfig.parse(row.fir_lifecycle.policy.config):defaultPolicy;
        const details = obj(row.details);
        const parties = [...row.case_parties_case_id_relations];
        for (const [key, kind] of row.service_code === 'legal_notice' ? [['client', 'sender'], ['noticee', 'noticee']] as const : []) {
          const value = name(obj(details[key]).fullName);
          if (value && !parties.some(p => p.kind === kind && p.name === value)) parties.push({kind, name: value});
        }
        const generated = new Set([row.notice_document_id, ...row.drafts_case_id_relations.map(d => d.document_id)].filter(Boolean));
        const documents = {client: 0, admin: 0, generated: 0, advocate: 0};
        const simulated_documents = {client: 0, admin: 0, generated: 0, advocate: 0};
        for (const doc of row.documents_case_id_relations) {
          const origin = generated.has(doc.id) ? 'generated' : doc.owner_id_relation.role;
          documents[origin]++;
          if (doc.simulated) simulated_documents[origin]++;
        }
        return {
          service_code: input.service,
          ...(consultation?{sub_status:row.sub_status,review_submitted_at:pendingReports.find(r=>r.case_id===row.id)?.submitted_at?.toISOString()??null,
            consultation:sessions.find(s=>s.case_id===row.id)?{scheduled_at:sessions.find(s=>s.case_id===row.id)!.scheduled_at.toISOString(),status:sessions.find(s=>s.case_id===row.id)!.status}:null}:{}),
          ...(input.service==='fir_draft'?{turnaround:!['completed','cancelled','refunded'].includes(row.status)&&policy?{paid_at:(row.fir_lifecycle?.paid_at??row.payments_case_id_relations[0]?.captured_at)?.toISOString()??null,warning_hours:policy.turnaround_warning_hours,overdue_hours:policy.turnaround_overdue_hours}:null}:{}),
          id: row.id, reference: row.reference, client: {id: row.client_id_relation.id, name: row.client_id_relation.full_name},
          matter_type: row.matter_type, parties: parties.filter(p => p.name.trim()),
          advocate: row.advocate_id_relation ? {id: row.advocate_id_relation.id, name: row.advocate_id_relation.full_name} : null,
          documents, simulated_documents, simulated: row.case_events_case_id_relations.some(e=>e.source==='simulated'), status: row.status as CaseStatus, bucket: adminBucketFor(row.status as CaseStatus,row.service_code,row.sub_status)!,
          ...(row.service_code==='fir_draft'?{sub_status:row.sub_status,approval:firApproval(row.case_events_case_id_relations)}:{}),
          ...(isReportService(row.service_code)?{sub_status:row.sub_status}:{}),
          amount_paise: row.pricing_id_relation?.base_amount_paise.toString() ?? null,
          created_at: row.created_at.toISOString(),
        };
      });
      const last = items.at(-1);
      return {items, counts, total, approval_waiting, filtered_total: await tx.case.count({where:filtered}),
        next_cursor: rows.length > input.limit && last ? Buffer.from(JSON.stringify({id:last.id,created_at:input.queue?rows[input.limit-1].updated_at.toISOString():last.created_at,scope})).toString('base64url') : null};
    }, {isolationLevel: 'RepeatableRead'});
  }
}
