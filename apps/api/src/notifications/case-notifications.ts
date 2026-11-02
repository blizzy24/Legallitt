import type { CaseStatus } from '@legalitt/shared';
import type { Prisma } from '../generated/prisma/client';
import type { NotificationsPort } from './notifications.port';

// Approved event wording from the project owner's notifications instruction (§9.2).
export async function notifyCaseTransition(tx: Prisma.TransactionClient, inbox: NotificationsPort,
  record: {id: string; reference: string; client_id: string; advocate_id: string | null; status: `${CaseStatus}`}) {
  const recipients: {user_id: string; kind: string; title: string}[] = [];
  const client = (kind: string, title: string) => recipients.push({user_id: record.client_id, kind, title});
  const advocate = (kind: string, title: string) => {
    if (record.advocate_id) recipients.push({user_id: record.advocate_id, kind, title});
  };
  const admins = async (kind: string, title: string) => {
    for (const admin of await tx.user.findMany({where: {role: 'admin', status: 'active'}, select: {id: true}}))
      recipients.push({user_id: admin.id, kind, title});
  };
  switch (record.status) {
    case 'paid': await admins('assignment_needed', 'A paid case needs an advocate'); break;
    case 'assigned': client('advocate_assigned', 'Advocate assigned'); advocate('case_assigned', 'A case assigned to you'); break;
    case 'client_review': client('draft_ready', 'Draft ready to review'); break;
    case 'approved': advocate('client_approved', 'Client approved'); break;
    case 'changes_requested': advocate('changes_requested', 'Client requested changes'); break;
    case 'advocate_declined': await admins('advocate_declined', 'An advocate declined'); break;
    case 'dispatched': client('notice_dispatched', 'Notice dispatched'); await admins('delivery_confirmation_needed', 'A case needs delivery confirmed'); break;
    case 'completed': client('notice_delivered', 'Notice delivered'); break;
  }
  for (const recipient of recipients) await inbox.send(tx, {...recipient, case_id: record.id, body: record.reference});
}
