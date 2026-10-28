import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

type Ticket = {userId: string; role: string; caseId: string; expires: number; documentId?: string; paths?: readonly RegExp[]};

/** Provenance only: every request still needs a valid Cognito session for the
 * same seeded identity. A ticket narrows what that identity may do, never widens it. */
@Injectable()
export class SystemTrigger {
  private readonly tickets = new Map<string, Ticket>();
  issue(adminId: string, caseId: string) {
    return this.store({userId: adminId, role: 'admin', caseId, expires: Date.now() + 300_000});
  }
  /** One demo-progression step (§2.12): this user, this case, these exact routes. */
  issueScoped(user: {id: string; role: string}, caseId: string, paths: readonly RegExp[]) {
    return this.store({userId: user.id, role: user.role, caseId, expires: Date.now() + 60_000, paths});
  }
  private store(ticket: Ticket) {
    const token = randomBytes(32).toString('hex');
    this.tickets.set(token, ticket);
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
    const allowed = ticket?.paths ? ticket.paths.some(p => p.test(path)) : this.deliveryPath(ticket, path, body);
    if (!ticket || ticket.expires < Date.now() || user.role !== ticket.role || user.id !== ticket.userId || !allowed)
      throw new UnauthorizedException('Invalid system operation provenance');
    return {trigger: 'system' as const, source: 'simulated' as const};
  }
  private deliveryPath(ticket: Ticket | undefined, path: string, body: unknown) {
    const input = body as {case_id?: string; kind?: string; pod_document_id?: string} | undefined;
    const presign = path === '/api/v1/documents/presign' && input?.case_id === ticket?.caseId && input?.kind === 'proof_of_delivery';
    const complete = ticket?.documentId && path === `/api/v1/documents/${ticket.documentId}/complete`;
    const delivered = ticket?.documentId && path === `/api/v1/cases/${ticket.caseId}/delivered` && input?.pod_document_id === ticket.documentId;
    return Boolean(presign || complete || delivered);
  }
}
