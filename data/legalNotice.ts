// Legal Notice service data: prices and the payment invoice. Everything money-related
// on the detail, payment, scan-pay and success screens reads from here.

export type InvoiceLine = { label: string; amount: number };

// Two price points from design/22 (service detail). Which is which is confirmed
// there; the payment invoice charges the standard fee.
export const LEGAL_NOTICE_PRICES = {
  standard: 999,
  express: 699,
};

export const INVOICE = {
  service: 'Legal Notice',
  refId: 'LGT-849204',
  requestId: 'PSR739482',
  lines: [
    { label: 'Service Fee', amount: LEGAL_NOTICE_PRICES.standard },
    // design/28 shows ₹179 for 18% GST (18% of ₹999 is ₹179.82) — kept as drawn.
    { label: 'Goods & Services Tax (GST 18%)', amount: 179 },
    // design/28 reads "Plat form fees"; rendered as "Platform fees".
    { label: 'Platform fees', amount: 199 },
  ] as InvoiceLine[],
};

export function invoiceTotal(lines: InvoiceLine[] = INVOICE.lines) {
  return lines.reduce((sum, l) => sum + l.amount, 0);
}

/** "₹1,377" — Indian grouping for the amounts this app shows. */
export function rupees(n: number, grouped = true) {
  return '₹' + (grouped ? n.toLocaleString('en-IN') : String(n));
}
