import { createHash } from 'node:crypto';
import { ConflictException } from '@nestjs/common';
import type { PaymentQuote, QuoteBreakdown } from '@legalitt/shared';
import type { Prisma, Case } from '../generated/prisma/client';
import { calculateQuote, halfUp } from './quote-math';
import {ensureNoticeLifecycle, NoticeWorkflowPolicySchema} from '../cases/notice-lifecycle';

export type QuoteSnapshot = {breakdown: QuoteBreakdown; documents: unknown[]; rules: unknown};
export const activeAt = (now: Date) => ({effective_from: {lte: now}, OR: [{effective_to: null}, {effective_to: {gt: now}}]});
export const newest = [{effective_from: 'desc' as const}, {id: 'asc' as const}];
export const blockedQuote = (code: string, message: string, documents: {id: string; filename: string; reason: string}[] = []): PaymentQuote =>
  ({status: 'blocked', code, message, documents});

export async function quoteDocuments(tx: Prisma.TransactionClient, caseId: string, excludeGeneratedConsultation = false) {
  const documents = await tx.document.findMany({where: {case_id: caseId, status: {not: 'deleted'}, ...(excludeGeneratedConsultation ? {kind:{not:'consultation_report'}} : {})}, orderBy: {id: 'asc'},
    select: {id: true, filename: true, mime_type: true, status: true, page_count: true, size_bytes: true}});
  const snapshot = documents.map(d => ({...d, size_bytes: d.size_bytes.toString()}));
  const record = await tx.case.findUniqueOrThrow({where: {id: caseId}, select: {service_code: true, details: true}});
  const filing = record.details as {intake_version?: number; noticee?: {methods?: string[]}};
  const noticeMethods = record.service_code === 'legal_notice' && filing.intake_version === 2 ? [...(filing.noticee?.methods ?? [])].sort() : null;
  const fingerprint = createHash('sha256').update(JSON.stringify(noticeMethods ? {documents: snapshot, methods: noticeMethods} : snapshot)).digest('hex');
  const unresolved = documents.filter(d => d.status !== 'uploaded' ||
    (d.mime_type === 'application/pdf' && (!d.page_count || d.page_count < 1)))
    .map(d => ({id: d.id, filename: d.filename, reason: d.status !== 'uploaded'
      ? 'Upload unfinished. Return to Documents and finish or remove this upload.'
      : 'PDF pages could not be counted. Return to Documents, remove this file and upload a readable, unlocked PDF.'}));
  return {snapshot, fingerprint, unresolved,
    pages: documents.filter(d => d.mime_type === 'application/pdf').reduce((sum, d) => sum + (d.page_count ?? 0), 0)};
}

export async function createPriceQuote(tx: Prisma.TransactionClient, record: Case): Promise<PaymentQuote> {
  if (record.status !== 'payment_pending') return blockedQuote('case_stage', 'Payment is not available at this stage. Return to your case to continue.');
  const docs = await quoteDocuments(tx, record.id);
  if (docs.unresolved.length) return blockedQuote('document_pages_unresolved',
    'Payment is blocked because some document uploads or PDF page counts are incomplete. Fix the files below, then retry the price calculation.', docs.unresolved);
  const previous = await tx.casePriceQuote.findFirst({where: {case_id: record.id}, orderBy: [{created_at: 'desc'}, {id: 'asc'}]});
  if (previous && previous.document_fingerprint === docs.fingerprint)
    return {status: 'ready', id: previous.id, breakdown: (previous.snapshot as unknown as QuoteSnapshot).breakdown};
  const base = record.pricing_id ? await tx.servicePricing.findUnique({where: {id: record.pricing_id}}) : null;
  if (!base) return blockedQuote('pricing_unavailable', 'A confirmed price is not available. Please contact support before paying.');
  const now = new Date();
  let breakdown: QuoteBreakdown;
  let commissionId: string | null = null, pageId: string | null = null, deliveryId: string | null = null;
  let rules: unknown;
  if (base.fee_policy_id) {
    const policy = await tx.feePolicy.findUniqueOrThrow({where: {id: base.fee_policy_id}, include: {page_overage_policy: true}});
    const page = policy.page_overage_policy;
    const commission = previous?.commission_rate_id
      ? await tx.commissionRate.findUnique({where: {id: previous.commission_rate_id}})
      : await tx.commissionRate.findFirst({where: {service_code: record.service_code, confirmed: true, ...activeAt(now)}, orderBy: newest});
    if (!commission) return blockedQuote('commission_unavailable', 'The payment breakdown is not ready. Please contact support before paying.');
    if (policy.base_represents !== 'advocate_share' || policy.platform_calculation !== 'commission_gross_up' ||
      policy.gst_basis !== 'base_plus_platform' || policy.delivery_recipient !== 'advocate' || policy.rounding !== 'half_up_paise' ||
      page.aggregation !== 'case' || page.page_basis !== 'verified_pdf_pages' || page.revenue_recipient !== 'platform')
      return blockedQuote('policy_unavailable', 'The payment rules need review. Please contact support before paying.');
    const filing = record.details as {intake_version?: number; noticee?: {methods?: string[]}};
    const newNotice = record.service_code === 'legal_notice' && filing.intake_version === 2;
    const workflow = newNotice ? await ensureNoticeLifecycle(tx, record) : null;
    const workflowPolicy = workflow ? NoticeWorkflowPolicySchema.parse(workflow.policy.config) : null;
    const delivery = policy.delivery_pricing_id && (!newNotice || filing.noticee?.methods?.includes('courier')) ? await tx.servicePricing.findUniqueOrThrow({where: {id: policy.delivery_pricing_id}}) : null;
    if (delivery && delivery.gst_bps !== 0) throw new ConflictException('Delivery policy must exclude GST');
    commissionId = commission.id; pageId = page.id; deliveryId = delivery?.id ?? null;
    breakdown = calculateQuote({base: base.base_amount_paise, commissionBps: commission.rate_bps, gstBps: base.gst_bps,
      delivery: delivery?.base_amount_paise ?? 0n, pages: docs.pages, includedPages: page.included_pages,
      pagePrice: page.unit_amount_paise, pageGstBps: page.gst_bps, deliveryRecipient: workflowPolicy?.delivery_recipient ?? 'advocate'});
    rules = {policy, commission, page, base, delivery, ...(workflow ? {notice_workflow_policy: workflow.policy} : {})};
  } else {
    // Already submitted legacy cases keep their pinned tariff. No historical
    // commission or page charge is invented. New submissions select confirmed rows.
    const submitted = await tx.caseEvent.findFirst({where: {case_id: record.id, to_status: 'submitted'}, orderBy: {id: 'asc'}});
    const at = submitted?.created_at ?? record.created_at;
    const old = await tx.servicePricing.findMany({where: {service_code: record.service_code, confirmed: false,
      variant: {in: ['platform_fee', 'delivery_fee']}, ...activeAt(at)}, orderBy: newest});
    const platform = old.find(p => p.variant === 'platform_fee'), delivery = old.find(p => p.variant === 'delivery_fee');
    if (!platform || !delivery) return blockedQuote('legacy_pricing_unavailable', 'The original fee breakdown is unavailable. Please contact support; do not make another payment.');
    deliveryId = delivery.id;
    const subtotal = base.base_amount_paise + platform.base_amount_paise + delivery.base_amount_paise;
    const gst = [base, platform, delivery].reduce((sum, p) => sum + halfUp(p.base_amount_paise * BigInt(p.gst_bps), 10000n), 0n);
    breakdown = {service_fee_paise: base.base_amount_paise.toString(), platform_fee_paise: platform.base_amount_paise.toString(),
      delivery_fee_paise: delivery.base_amount_paise.toString(), taxable_subtotal_paise: subtotal.toString(), gst_paise: gst.toString(),
      page_overage_paise: '0', page_overage_gst_paise: '0', total_pages: docs.pages, included_pages: 0, charged_pages: 0, page_unit_paise: '0',
      total_paise: (subtotal + gst).toString(), advocate_entitlement_paise: null, platform_revenue_paise: null};
    rules = {legacy: true, base, platform, delivery};
  }
  const snapshot = JSON.parse(JSON.stringify({breakdown, documents: docs.snapshot, rules}, (_, v) => typeof v === 'bigint' ? v.toString() : v));
  const quote = await tx.casePriceQuote.create({data: {case_id: record.id, pricing_id: base.id,
    commission_rate_id: commissionId, fee_policy_id: base.fee_policy_id, delivery_pricing_id: deliveryId,
    page_overage_policy_id: pageId, document_fingerprint: docs.fingerprint, snapshot}});
  return {status: 'ready', id: quote.id, breakdown};
}
