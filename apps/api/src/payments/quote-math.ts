/** Integer paise only. Policy values are supplied by versioned database rows. */
export const halfUp = (numerator: bigint, denominator: bigint) =>
  (numerator + denominator / 2n) / denominator;

export function calculateQuote(input: {
  base: bigint; commissionBps: number; gstBps: number; delivery: bigint;
  pages: number; includedPages: number; pagePrice: bigint; pageGstBps: number;
}) {
  const {base, commissionBps, gstBps, delivery, pages, includedPages, pagePrice, pageGstBps} = input;
  if (base < 0n || delivery < 0n || pagePrice < 0n ||
      !Number.isInteger(commissionBps) || commissionBps < 0 || commissionBps >= 10000 ||
      !Number.isSafeInteger(pages) || pages < 0 || !Number.isInteger(includedPages) || includedPages < 0 ||
      !Number.isInteger(gstBps) || gstBps < 0 || !Number.isInteger(pageGstBps) || pageGstBps < 0)
    throw new Error('Invalid pricing policy');
  const platform = halfUp(base * BigInt(commissionBps), BigInt(10000 - commissionBps));
  const chargedPages = Math.max(0, pages - includedPages);
  const overage = BigInt(chargedPages) * pagePrice;
  const taxable = base + platform;
  const gst = halfUp(taxable * BigInt(gstBps), 10000n);
  const overageGst = halfUp(overage * BigInt(pageGstBps), 10000n);
  return {
    service_fee_paise: base.toString(), platform_fee_paise: platform.toString(),
    delivery_fee_paise: delivery.toString(), taxable_subtotal_paise: taxable.toString(),
    gst_paise: gst.toString(), page_overage_gst_paise: overageGst.toString(),
    page_overage_paise: overage.toString(), total_pages: pages, included_pages: includedPages,
    charged_pages: chargedPages, page_unit_paise: pagePrice.toString(),
    total_paise: (taxable + delivery + gst + overage + overageGst).toString(),
    advocate_entitlement_paise: (base + delivery).toString(),
    platform_revenue_paise: (platform + overage).toString(),
  };
}
