import { NOTIFICATIONS, type NotificationsPort } from '../notifications/notifications.port';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ShipmentDetailsSchema, ShipmentStatusInputSchema, nextShipmentStatus, type ShipmentStatus } from '@legalitt/shared';
import { PrismaService } from '../prisma.service';
import { parse } from '../auth/auth.service';
import { COURIER, type CourierPort } from '../courier/courier.port';
import type { CaseActor } from './case-access';
import { lockedCase, appendCaseEvent } from './case-state-machine';

const DETAIL_KEYS = ['carrier', 'waybill', 'dispatch_date', 'courier_office', 'courier_phone', 'tracking_url', 'expected_delivery', 'receipt_document_id'] as const;
type Details = Record<(typeof DETAIL_KEYS)[number], string | null>;
const day = (value: Date | null) => value ? value.toISOString().slice(0, 10) : null;
const emptyDetails = (): Details => Object.fromEntries(DETAIL_KEYS.map(key => [key, null])) as Details;
// Stored values in the request's own form, so an unchanged field compares equal.
const shipmentDetails = (s: {carrier: string | null; waybill: string | null; dispatch_date: Date | null; courier_office: string | null;
  courier_phone: string | null; tracking_url: string | null; expected_delivery: Date | null; receipt_document_id: string | null}): Details => ({
  carrier: s.carrier || null, waybill: s.waybill || null, dispatch_date: day(s.dispatch_date), courier_office: s.courier_office || null,
  courier_phone: s.courier_phone || null, tracking_url: s.tracking_url || null, expected_delivery: day(s.expected_delivery),
  receipt_document_id: s.receipt_document_id || null,
});

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService, @Inject(COURIER) private readonly courier: CourierPort, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  async receive(actor: CaseActor, caseId: string) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, caseId);
      const shipment = await tx.shipment.findFirst({where:{case_id:caseId,direction:'to_advocate'},orderBy:[{booked_at:'desc'},{id:'desc'}]});
      if (!shipment) throw new BadRequestException('No inbound shipment exists for this case');
      const existing = await tx.caseEvent.findFirst({where:{case_id:caseId,type:'documents_received',payload:{path:['shipment_id'],equals:shipment.id}}});
      if (existing) return shipment;
      const delivered = await tx.shipment.update({where:{id:shipment.id},data:{status:'delivered',delivered_at:new Date()}});
      await appendCaseEvent(tx,{case_id:caseId,type:'documents_received',source:'real',actor_id:actor.id,actor_role:actor.role,
        from_status:record.status,to_status:record.status,
        payload:{shipment_id:shipment.id,confirmation_source:'advocate'},
      });
      await this.notifications.send(tx, {user_id: actor.id, case_id: caseId, kind: 'documents_received', title: 'Documents received', body: record.reference});
      return delivered;
    });
  }
  /** Admin moves a dispatched notice one courier milestone forward (design 440).
   * Delivered is not set here: it needs proof of delivery, via the deliver route. */
  async advance(actor: CaseActor, caseId: string, body: unknown) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin required');
    const {status} = parse(ShipmentStatusInputSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, caseId);
      if (record.status !== 'dispatched') throw new ConflictException('Only a dispatched notice has courier milestones');
      const shipment = await tx.shipment.findFirst({where: {case_id: caseId, direction: 'to_recipient'}, orderBy: [{booked_at: 'desc'}, {id: 'desc'}]});
      if (!shipment) throw new ConflictException('Dispatched shipment not found');
      if (nextShipmentStatus(shipment.status as ShipmentStatus) !== status)
        throw new ConflictException('Shipment milestones advance one step at a time');
      const updated = await tx.shipment.update({where: {id: shipment.id}, data: {status}});
      await appendCaseEvent(tx, {case_id: caseId, type: 'shipment_status_changed', source: actor.source ?? 'real',
        actor_id: actor.trigger === 'system' ? null : actor.id, actor_role: actor.trigger === 'system' ? null : actor.role,
        from_status: record.status, to_status: record.status,
        payload: {shipment_id: shipment.id, from: shipment.status, to: status, ...(actor.trigger === 'system' ? {actor: 'system'} : {})},
      });
      await tx.adminAction.create({data: {admin_id: actor.id, action: 'shipment_status', subject_type: 'case', subject_id: caseId,
        payload: {shipment_id: shipment.id, from: shipment.status, to: status}}});
      return updated;
    });
  }
  /** Saves the advocate's courier details (design 286). Owner decision, 4 November
   * 2026: complete details (Courier Name, Tracking Number, Dispatch Date) are a booked
   * shipment, so a save never undoes a booking; blanking a required field returns it to
   * draft. Only supplied fields change, and a save that changes nothing writes nothing.
   * `book` additionally refuses incomplete details. */
  async save(actor: CaseActor, caseId: string, body: unknown, book = false) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const input = parse(ShipmentDetailsSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, caseId);
      if (!['approved', 'dispatching'].includes(record.status)) throw new ConflictException('Courier details can only be saved before dispatch');
      const prior = await tx.shipment.findFirst({where: {case_id: caseId, direction: 'to_recipient'}, orderBy: [{booked_at: 'desc'}, {id: 'desc'}]});
      if (prior && !['draft', 'booked'].includes(prior.status)) throw new ConflictException('Shipment already dispatched');
      const before = prior ? shipmentDetails(prior) : emptyDetails();
      const after = {...before, ...Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value || null]))} as Details;
      const complete = Boolean(after.carrier?.trim() && after.waybill?.trim() && after.dispatch_date);
      if (book && !complete) throw new BadRequestException('Courier Name, Tracking Number and Dispatch Date are required');
      const changed = DETAIL_KEYS.filter(key => after[key] !== before[key]);
      if (changed.includes('receipt_document_id') && after.receipt_document_id) {
        const receipt = await tx.document.findFirst({where: {id: after.receipt_document_id, case_id: caseId, status: 'uploaded'}});
        if (!receipt) throw new BadRequestException('Upload the courier receipt for this case first');
      }
      const status = complete ? 'booked' : 'draft';
      if (prior && !changed.length && prior.status === status) return prior;
      // Nothing to save and nothing saved yet: create no empty shipment and no event.
      if (!prior && !changed.length) throw new BadRequestException('Enter the courier details first');
      const data = {...after,
        dispatch_date: after.dispatch_date ? new Date(after.dispatch_date + 'T00:00:00Z') : null,
        expected_delivery: after.expected_delivery ? new Date(after.expected_delivery + 'T00:00:00Z') : null,
        status, simulated: this.courier.simulated,
      };
      const shipment = prior ? await tx.shipment.update({where: {id: prior.id}, data}) : await tx.shipment.create({data: {
        ...data, case_id: caseId, direction: 'to_recipient', booked_at: new Date(),
        recipient: (record.details as {noticee?: object}).noticee ?? {},
      }});
      const booked = status === 'booked' && prior?.status !== 'booked';
      await appendCaseEvent(tx, {case_id: caseId, type: booked ? 'shipment_booked' : 'shipment_details_saved',
        source: this.courier.simulated ? 'simulated' : 'real', actor_id: actor.id, actor_role: actor.role,
        from_status: record.status, to_status: record.status, payload: {shipment_id: shipment.id, changed, shipment_status: status},
      });
      return shipment;
    });
  }
}
