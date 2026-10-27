import { z } from 'zod';

const text = z.string().trim().max(200).nullable().optional();
const date = z.iso.date().nullable().optional();
export const ShipmentDetailsSchema = z.strictObject({
  carrier: text,
  waybill: text,
  dispatch_date: date,
  courier_office: text,
  courier_phone: text,
  // Preserve the supplied text; do not derive a carrier URL or normalize it.
  tracking_url: z.string().max(2000).nullable().optional(),
  expected_delivery: date,
  receipt_document_id: z.uuid().nullable().optional(),
});
export type ShipmentDetails = z.infer<typeof ShipmentDetailsSchema>;
export type ApiShipment = Required<ShipmentDetails> & {
  id: string; case_id: string; direction: string;
  status: 'draft' | 'booked' | 'dispatched' | 'delivered';
  recipient: Record<string, unknown>; simulated: boolean;
  booked_at: string | null; dispatched_at: string | null; delivered_at: string | null;
  pod_document_id: string | null;
};
