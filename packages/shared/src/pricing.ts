export type QuoteBreakdown = {
  service_fee_paise: string; platform_fee_paise: string; delivery_fee_paise: string;
  taxable_subtotal_paise: string; gst_paise: string; page_overage_gst_paise: string;
  page_overage_paise: string; total_pages: number; included_pages: number;
  charged_pages: number; page_unit_paise: string; total_paise: string;
  advocate_entitlement_paise: string | null; platform_revenue_paise: string | null;
};
export type PaymentQuote =
  | {status: 'ready'; id: string; breakdown: QuoteBreakdown; simulated?:boolean}
  | {status: 'blocked'; code: string; message: string;
      documents: {id: string; filename: string; reason: string}[]};
/** Exact display of integer paise, including values beyond Number's safe range. */
export function formatPaise(value: string) {
  const amount = BigInt(value);
  return `₹${(amount / 100n).toLocaleString('en-IN')}.${(amount % 100n).toString().padStart(2, '0')}`;
}
