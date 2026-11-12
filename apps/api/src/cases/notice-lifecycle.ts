import {ConflictException} from '@nestjs/common';
import {z} from 'zod';
import type {Case, Prisma} from '../generated/prisma/client';

export const NoticeWorkflowPolicySchema = z.object({
  delivery_recipient: z.literal('platform'), retry_courier_paise: z.string().regex(/^\d+$/),
  turnaround_days: z.object({urgent: z.number().int().positive(), ordinary: z.number().int().positive()}),
  deadline_alert_hours: z.number().positive(), client_reminder_hours: z.array(z.number().positive()),
  client_idle_admin_hours: z.number().positive(), change_round_alert: z.number().int().positive(),
  esign_mode: z.literal('test'), whatsapp_mode: z.literal('manual'), email_mode: z.literal('ses'),
});
export async function ensureNoticeLifecycle(tx: Prisma.TransactionClient, record: {id: string; details: unknown; tier: string | null}) {
  const existing = await tx.noticeLifecycle.findUnique({where: {case_id: record.id}, include: {policy: true}});
  if (existing) {
    if(!existing.deadline_at){
      const paid=await tx.payment.findFirst({where:{case_id:record.id,status:'captured',purpose:'service_fee'},orderBy:{captured_at:'asc'}});
      if(paid?.captured_at){const settings=NoticeWorkflowPolicySchema.parse(existing.policy.config);return tx.noticeLifecycle.update({where:{case_id:record.id},data:{deadline_at:new Date(paid.captured_at.getTime()+settings.turnaround_days[record.tier==='urgent'?'urgent':'ordinary']*86400000)},include:{policy:true}});}
    }
    return existing;
  }
  const policy = await tx.noticeWorkflowPolicy.findFirst({where: {effective_from: {lte: new Date()}}, orderBy: {version: 'desc'}});
  if (!policy) throw new ConflictException('Legal Notice workflow settings are unavailable. Contact support.');
  const settings = NoticeWorkflowPolicySchema.parse(policy.config);
  const details = record.details as {noticee?: Record<string, unknown>};
  const paid = await tx.payment.findFirst({where: {case_id: record.id, status: 'captured', purpose: 'service_fee'}, orderBy: {captured_at: 'asc'}});
  const contacts = {...details.noticee, methods: Array.isArray(details.noticee?.methods) ? details.noticee.methods : ['courier']} as Prisma.InputJsonObject;
  return tx.noticeLifecycle.create({data: {case_id: record.id, policy_id: policy.id, contacts,
    deadline_at: paid?.captured_at ? new Date(paid.captured_at.getTime() + settings.turnaround_days[record.tier === 'urgent' ? 'urgent' : 'ordinary'] * 86400000) : null}, include: {policy: true}});
}
export function requireNoticeRevision(actual: number, expected: number) {
  if (actual !== expected) throw new ConflictException('This notice has changed. Refresh before taking this action.');
}
