import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import type { AdminCaseDetail, AdminContact } from '@legalitt/shared';
import { PrismaService } from '../prisma.service';
import { parse } from '../auth/auth.service';
import { caseScope, type CaseActor } from '../cases/case-access';
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const str = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : null;
@Injectable()
export class AdminCaseDetailRepository {
  constructor(private readonly prisma: PrismaService) {}
  async get(actor: CaseActor, id: string): Promise<AdminCaseDetail> {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin access required');
    parse(z.uuid(), id);
    const db = await this.prisma.getClient();
    const row = await db.case.findFirst({where: {...caseScope(actor), id}, include: {
      client_id_relation: true, advocate_id_relation: true, pricing_id_relation: true,
      case_parties_case_id_relations: true,
      case_events_case_id_relations: {orderBy: [{created_at: 'desc'}, {id: 'desc'}], include: {actor_id_relation: {select: {full_name: true}}}},
      documents_case_id_relations: {where: {status: {not: 'deleted'}}, orderBy: {created_at: 'desc'}, include: {owner_id_relation: {select: {role: true, full_name: true}}}},
      drafts_case_id_relations: {orderBy: {version: 'desc'}, include: {created_by_relation: {select: {full_name: true}}}},
      payments_case_id_relations: {orderBy: {created_at: 'desc'}, include: {payer: {select: {full_name: true, role: true}}}},
      shipments_case_id_relations: {orderBy: {id: 'asc'}},
    }});
    if (!row) throw new NotFoundException('Legal Notice not found');
    const intake = obj(row.details), client = obj(intake.client), noticee = obj(intake.noticee);
    const contacts: AdminContact[] = [{role: 'client', name: row.client_id_relation.full_name,
      email: row.client_id_relation.email, phone: row.client_id_relation.phone, address: null}];
    // Intake contacts are separately labelled: do not silently replace account data.
    for (const [role, values] of [['sender', client], ['noticee', noticee]] as const) {
      if (Object.values(values).some(str)) contacts.push({role, name: str(values.fullName), email: str(values.email), phone: str(values.mobile), address: str(values.address), relationship: str(values.relationship)});
    }
    if (row.advocate_id_relation) contacts.splice(1, 0, {role: 'advocate', name: row.advocate_id_relation.full_name, email: row.advocate_id_relation.email, phone: row.advocate_id_relation.phone, address: null});
    for (const party of row.case_parties_case_id_relations) {
      const values = obj(party.details);
      if (contacts.some(c => c.role === party.kind && c.name === party.name)) continue;
      contacts.push({role: party.kind, name: party.name, email: str(values.email), phone: str(values.mobile) ?? str(values.phone), address: str(values.address), relationship: str(values.relationship)});
    }
    const generated = new Set(row.drafts_case_id_relations.map(d => d.document_id).filter(Boolean));
    if (row.notice_document_id) generated.add(row.notice_document_id);
    const events = row.case_events_case_id_relations.map(e => ({id: e.id.toString(), type: e.type, from_status: e.from_status, to_status: e.to_status,
      actor: e.actor_id_relation ? {name: e.actor_id_relation.full_name, role: e.actor_role} : obj(e.payload).actor === 'system' ? {name: 'System', role: null} : null,
      source: e.source, payload: obj(e.payload), created_at: e.created_at.toISOString()}));
    const documents = row.documents_case_id_relations.map(d => ({id: d.id, filename: d.filename, kind: d.kind,
      origin: generated.has(d.id) ? 'generated' as const : d.owner_id_relation.role, owner: d.owner_id_relation.full_name,
      status: d.status, mime_type: d.mime_type, page_count: d.page_count, size_bytes: d.size_bytes.toString(), simulated: d.simulated,
      created_at: d.created_at.toISOString(), final: row.notice_document_id === d.id, draft_version: row.drafts_case_id_relations.find(v => v.document_id === d.id)?.version ?? null}));
    const payments = row.payments_case_id_relations.map(p => ({id: p.id, purpose: p.purpose, base_amount_paise: p.base_amount_paise.toString(), gst_paise: p.gst_paise.toString(), total_paise: p.total_paise.toString(), status: p.status,
      payer: {name: p.payer.full_name, role: p.payer.role}, simulated: p.simulated, created_at: p.created_at.toISOString(), captured_at: p.captured_at?.toISOString() ?? null}));
    const shipments: AdminCaseDetail['shipments'] = row.shipments_case_id_relations.map(s => ({id: s.id, case_id: s.case_id, direction: s.direction, status: s.status as AdminCaseDetail['shipments'][number]['status'],
      carrier: s.carrier, waybill: s.waybill, recipient: obj(s.recipient), dispatch_date: s.dispatch_date?.toISOString().slice(0,10) ?? null,
      courier_office: s.courier_office, courier_phone: s.courier_phone, tracking_url: s.tracking_url, expected_delivery: s.expected_delivery?.toISOString().slice(0,10) ?? null,
      receipt_document_id: s.receipt_document_id, pod_document_id: s.pod_document_id, simulated: s.simulated,
      booked_at: s.booked_at?.toISOString() ?? null, dispatched_at: s.dispatched_at?.toISOString() ?? null, delivered_at: s.delivered_at?.toISOString() ?? null}));
    return {id: row.id, reference: row.reference, status: row.status as AdminCaseDetail['status'], sub_status: row.sub_status, matter_type: row.matter_type, tier: row.tier,
      simulated: events.some(e => e.source === 'simulated') || documents.some(d => d.simulated) || payments.some(p => p.simulated) || shipments.some(s => s.simulated),
      created_at: row.created_at.toISOString(), advocate_id: row.advocate_id, contacts, intake,
      pricing: row.pricing_id_relation ? {base_amount_paise: row.pricing_id_relation.base_amount_paise.toString(), gst_bps: row.pricing_id_relation.gst_bps, confirmed: row.pricing_id_relation.confirmed} : null,
      events, documents, payments, shipments,
      drafts: row.drafts_case_id_relations.map(d => ({id: d.id, version: d.version, content: obj(d.content), document_id: d.document_id, generated_by: d.generated_by, author: d.created_by_relation.full_name, created_at: d.created_at.toISOString()})),
    };
  }
}
