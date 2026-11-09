import type { QuoteBreakdown } from '@legalitt/shared';
import { formatPaise } from '@legalitt/shared';

/** Format integer paise directly, without float conversion or whole-rupee rounding. */
export const paiseText = formatPaise;
export function quoteLines(b: QuoteBreakdown) {
  return [
    {label: 'Service Fee', value: paiseText(b.service_fee_paise)},
    {label: 'Legal Notice Delivery Fee', value: paiseText(b.delivery_fee_paise)},
    {label: 'Platform fees', value: paiseText(b.platform_fee_paise)},
    {label: 'Goods & Services Tax', value: paiseText(b.gst_paise)},
    ...(BigInt(b.page_unit_paise) > 0n ? [{
      label: `Additional PDF pages (${b.charged_pages} × ${paiseText(b.page_unit_paise)}, no GST)`,
      value: paiseText(b.page_overage_paise),
    }] : []),
  ];
}
