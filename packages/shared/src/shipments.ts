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
// Outbound milestones after dispatch are the Delivery Progress rows of design 440
// (Pickup Booked, Picked Up, In Transit, Out for Delivery, Delivered). An admin, or
// later a carrier integration, moves a dispatched shipment through them one step
// at a time. Delivered is only reached through proof-of-delivery confirmation.
export const SHIPMENT_STATUSES = [
  'draft', 'booked', 'dispatched', 'pickup_booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered',
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];
export const ShipmentMilestoneSchema = z.enum(['pickup_booked', 'picked_up', 'in_transit', 'out_for_delivery']);
export const ShipmentStatusInputSchema = z.strictObject({ status: ShipmentMilestoneSchema });
/** Shipments that have left the advocate and await delivery confirmation. */
export const IN_FLIGHT_SHIPMENT_STATUSES: readonly ShipmentStatus[] = ['dispatched', 'pickup_booked', 'picked_up', 'in_transit', 'out_for_delivery'];
export function nextShipmentStatus(status: ShipmentStatus): ShipmentStatus | null {
  const index = SHIPMENT_STATUSES.indexOf(status);
  return index >= 0 && index < SHIPMENT_STATUSES.length - 1 ? SHIPMENT_STATUSES[index + 1] : null;
}
export function shipmentReached(status: ShipmentStatus | undefined, milestone: ShipmentStatus) {
  return status !== undefined && SHIPMENT_STATUSES.indexOf(status) >= SHIPMENT_STATUSES.indexOf(milestone);
}
export type ApiShipment = Required<ShipmentDetails> & {
  id: string; case_id: string; direction: string;
  status: ShipmentStatus;
  recipient: Record<string, unknown>; simulated: boolean;
  booked_at: string | null; dispatched_at: string | null; delivered_at: string | null;
  pod_document_id: string | null;
};
