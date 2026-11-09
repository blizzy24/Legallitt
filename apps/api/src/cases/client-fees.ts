import type { CaseClientFees } from '@legalitt/shared';

type Price = {base_amount_paise: bigint; gst_bps: number; variant?: string | null};
type Payment = {base_amount_paise: bigint; gst_paise: bigint; total_paise: bigint; simulated: boolean; captured_at: Date | null; quote?: {snapshot: unknown} | null};
/** Client charges are not advocate earnings. Only show historical add-ons when
 * they reconcile with the captured receipt; never substitute today's prices. */
export function caseClientFees(base: Price | null, payment: Payment | undefined, atPayment: Price[]): CaseClientFees {
  if (payment?.quote) {
    const {breakdown: b} = payment.quote.snapshot as {breakdown: import('@legalitt/shared').QuoteBreakdown};
    return {service_fee_paise: b.service_fee_paise, platform_fee_paise: b.platform_fee_paise,
      delivery_fee_paise: b.delivery_fee_paise, page_overage_paise: b.page_overage_paise,
      gst_paise: payment.gst_paise.toString(), total_paise: payment.total_paise.toString(),
      breakdown_complete: b.total_paise === payment.total_paise.toString(), simulated: payment.simulated};
  }
  const platform = atPayment.find(p => p.variant === 'platform_fee');
  const delivery = atPayment.find(p => p.variant === 'delivery_fee');
  const rows = [base, platform, delivery];
  const reconciled = Boolean(payment && rows.every(Boolean)
    && rows.reduce((sum,p) => sum + p!.base_amount_paise,0n) === payment.base_amount_paise
    && rows.reduce((sum,p) => sum + (p!.base_amount_paise * BigInt(p!.gst_bps) + 5000n) / 10000n,0n) === payment.gst_paise
    && payment.base_amount_paise + payment.gst_paise === payment.total_paise);
  return {
    service_fee_paise: base?.base_amount_paise.toString() ?? null,
    platform_fee_paise: reconciled ? platform!.base_amount_paise.toString() : null,
    delivery_fee_paise: reconciled ? delivery!.base_amount_paise.toString() : null,
    gst_paise: payment?.gst_paise.toString() ?? null,
    total_paise: payment?.total_paise.toString() ?? null,
    breakdown_complete: reconciled,
    simulated: payment?.simulated ?? false,
  };
}
