import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ShipmentDetailsSchema, ShipmentStatusInputSchema, nextShipmentStatus, type ShipmentStatus } from '@legalitt/shared';
import { PrismaService } from '../prisma.service';
import { parse } from '../auth/auth.service';
import { COURIER, type CourierPort } from '../courier/courier.port';
import type { CaseActor } from './case-access';
import { lockedCase, appendCaseEvent } from './case-state-machine';

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService, @Inject(COURIER) private readonly courier: CourierPort) {}
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
  async save(actor: CaseActor, caseId: string, body: unknown, book = false) {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    const input = parse(ShipmentDetailsSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, caseId);
      if (!['approved', 'dispatching'].includes(record.status)) throw new ConflictException('Courier details can only be saved before dispatch');
      const prior = await tx.shipment.findFirst({where: {case_id: caseId, direction: 'to_recipient'}, orderBy: [{booked_at: 'desc'}, {id: 'desc'}]});
      if (prior && !['draft', 'booked'].includes(prior.status)) throw new ConflictException('Shipment already dispatched');
      const values = {...prior, ...input};
      if (book && (!values.carrier?.trim() || !values.waybill?.trim() || !values.dispatch_date))
        throw new BadRequestException('Courier Name, Tracking Number and Dispatch Date are required');
      if (input.receipt_document_id) {
        const receipt = await tx.document.findFirst({where: {id: input.receipt_document_id, case_id: caseId, status: 'uploaded'}});
        if (!receipt) throw new BadRequestException('Upload the courier receipt for this case first');
      }
      const data = {...input,
        ...(input.dispatch_date !== undefined ? {dispatch_date: input.dispatch_date ? new Date(input.dispatch_date + 'T00:00:00Z') : null} : {}),
        ...(input.expected_delivery !== undefined ? {expected_delivery: input.expected_delivery ? new Date(input.expected_delivery + 'T00:00:00Z') : null} : {}),
        status: book ? 'booked' : 'draft', simulated: this.courier.simulated,
      };
      const shipment = prior ? await tx.shipment.update({where: {id: prior.id}, data}) : await tx.shipment.create({data: {
        ...data, case_id: caseId, direction: 'to_recipient', booked_at: new Date(),
        recipient: (record.details as {noticee?: object}).noticee ?? {},
      }});
      await appendCaseEvent(tx, {case_id: caseId, type: book ? 'shipment_booked' : 'shipment_details_saved',
        source: this.courier.simulated ? 'simulated' : 'real', actor_id: actor.id, actor_role: actor.role,
        from_status: record.status, to_status: record.status, payload: {shipment_id: shipment.id},
      });
      return shipment;
    });
  }
}
