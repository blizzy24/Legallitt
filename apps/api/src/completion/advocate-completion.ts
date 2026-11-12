import {Controller, ForbiddenException, Get, Injectable, NotFoundException, Param, Req, UseGuards} from '@nestjs/common';
import {z} from 'zod';
import type {AdvocateCompletion, QuoteBreakdown} from '@legalitt/shared';
import {AuthGuard, type AuthRequest} from '../auth/auth.controller';
import {parse} from '../auth/auth.service';
import {PrismaService} from '../prisma.service';
import {caseScope, type CaseActor} from '../cases/case-access';

// D-07 / D-88: the advocate's view of a finished case. No design exists; the
// mobile screen reuses the existing advocate card layout. Entitlement comes only
// from captured price snapshots; nothing here claims a payout has been released.
@Injectable()
export class AdvocateCompletionService {
  constructor(private readonly prisma: PrismaService) {}
  async completion(actor: CaseActor, id: string): Promise<AdvocateCompletion> {
    if (actor.role !== 'advocate' && actor.role !== 'admin') throw new ForbiddenException('Advocate access required');
    const db = await this.prisma.getClient();
    const record = await db.case.findFirst({where: {AND: [caseScope(actor), {id}]},
      include: {shipments_case_id_relations: true, case_events_case_id_relations: {where: {type: {in: ['fir_released_to_client', 'fir_sent_to_client', 'service_report_released']}}, orderBy: {id: 'asc'}}}});
    if (!record) throw new NotFoundException('Case not found');
    const base = {service_code: record.service_code as AdvocateCompletion['service_code'], reference: record.reference, status: record.status};
    // D-53: a cancelled case says only that no further work is needed — never the
    // client's reason, the refund amount or any entitlement decision.
    const cancelled = record.status === 'cancelled' || record.status === 'refunded';
    if (record.status !== 'completed') return {...base, completed: false, cancelled, completed_at: null, delivery: null, documents: [], entitlement_paise: null, entitlement_complete: false};
    const docs: {id: string; label: string}[] = [];
    let delivery: AdvocateCompletion['delivery'] = null;
    if (record.service_code === 'legal_notice') {
      if (record.notice_document_id) docs.push({id: record.notice_document_id, label: 'Final notice'});
      const shipment = record.shipments_case_id_relations.filter(s => s.direction === 'to_recipient' && s.status === 'delivered')
        .sort((a, b) => (b.delivered_at?.getTime() ?? 0) - (a.delivered_at?.getTime() ?? 0))[0];
      if (shipment) {
        delivery = {delivered_at: shipment.delivered_at?.toISOString() ?? null, received_by: shipment.received_by, carrier: shipment.carrier, waybill: shipment.waybill};
        if (shipment.pod_document_id) docs.push({id: shipment.pod_document_id, label: 'Proof of delivery'});
      }
    }
    // FIR: the last draft sent to the client is the one they approved. There is no
    // police receipt: the police step is gone (Q119, Q120).
    const firSent = record.case_events_case_id_relations.filter(e => e.type === 'fir_sent_to_client').at(-1)?.payload as {document_id?: string} | undefined;
    if (firSent?.document_id) docs.push({id: firSent.document_id, label: 'Approved FIR draft'});
    for (const e of record.case_events_case_id_relations) {
      const p = e.payload as {document_id?: string; document_ids?: string[]};
      if (e.type === 'fir_released_to_client' && p.document_id) docs.push({id: p.document_id, label: 'Approved FIR draft'});
      if (e.type === 'service_report_released') for (const d of p.document_ids ?? []) docs.push({id: d, label: 'Released report'});
    }
    if (['legal_advice', 'high_court', 'district_court'].includes(record.service_code)) {
      const report = await db.consultationReport.findFirst({where: {case_id: id, status: 'approved', document_id: {not: null}}, orderBy: {version: 'desc'}});
      if (report?.document_id) docs.push({id: report.document_id, label: 'Approved brief'});
    }
    const files = await db.document.findMany({where: {id: {in: docs.map(d => d.id)}, case_id: id, status: 'uploaded'},
      select: {id: true, filename: true, mime_type: true, page_count: true, simulated: true}});
    // Client payments only (a courier payment is the advocate's own outlay).
    const payments = await db.payment.findMany({where: {case_id: id, payer_id: record.client_id, status: 'captured'},
      select: {quote: {select: {snapshot: true}}}});
    let total = 0n, complete = payments.length > 0;
    for (const p of payments) {
      const value = (p.quote?.snapshot as {breakdown?: QuoteBreakdown} | undefined)?.breakdown?.advocate_entitlement_paise;
      if (value == null) complete = false; else total += BigInt(value);
    }
    return {...base, completed: true, cancelled: false, completed_at: record.completed_at?.toISOString() ?? null, delivery,
      documents: docs.flatMap(d => {const f = files.find(x => x.id === d.id); return f ? [{...f, label: d.label}] : [];}),
      entitlement_paise: payments.length && total > 0n ? total.toString() : null, entitlement_complete: complete};
  }
}

@Controller('api/v1/advocate/cases') @UseGuards(AuthGuard)
export class AdvocateCompletionController {
  constructor(private readonly service: AdvocateCompletionService) {}
  @Get(':id/completion') completion(@Req() req: AuthRequest, @Param('id') v: string) {return this.service.completion(req.user!, parse(z.uuid(), v));}
}
