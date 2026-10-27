import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

/** Provenance only: every request still needs a valid admin Cognito session. */
@Injectable()
export class SystemTrigger {
  private readonly tickets = new Map<string, {adminId: string; caseId: string; expires: number; documentId?: string}>();
  issue(adminId: string, caseId: string) {
    const token = randomBytes(32).toString('hex');
    this.tickets.set(token, {adminId, caseId, expires: Date.now() + 300_000});
    return token;
  }
  document(token: string, documentId: string) {
    const ticket = this.tickets.get(token);
    if (!ticket) throw new Error('System operation expired');
    ticket.documentId = documentId;
  }
  revoke(token: string) { this.tickets.delete(token); }
  verify(token: string, user: {id: string; role: string}, path: string, body: unknown) {
    const ticket = this.tickets.get(token);
    const input = body as {case_id?: string; kind?: string; pod_document_id?: string} | undefined;
    const presign = path === '/api/v1/documents/presign' && input?.case_id === ticket?.caseId && input?.kind === 'proof_of_delivery';
    const complete = ticket?.documentId && path === `/api/v1/documents/${ticket.documentId}/complete`;
    const delivered = ticket?.documentId && path === `/api/v1/cases/${ticket.caseId}/delivered` && input?.pod_document_id === ticket.documentId;
    if (!ticket || ticket.expires < Date.now() || user.role !== 'admin' || user.id !== ticket.adminId || !(presign || complete || delivered))
      throw new UnauthorizedException('Invalid system operation provenance');
    return {trigger: 'system' as const, source: 'simulated' as const};
  }
}
