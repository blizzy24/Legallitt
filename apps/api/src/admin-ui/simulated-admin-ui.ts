import { Logger, type OnModuleDestroy } from '@nestjs/common';
import { z } from 'zod';
import type { PrismaService } from '../prisma.service';
import { demoPassword } from '../phone-auth/demo-accounts';
import type { AdminUiPort } from './admin-ui.port';
import { SystemTrigger } from './system-trigger';
import { simulatedProof } from './simulated-proof';

export class SimulatedAdminUi implements AdminUiPort, OnModuleDestroy {
  private readonly logger = new Logger(SimulatedAdminUi.name);
  private readonly pending = new Map<string, NodeJS.Timeout>();
  constructor(private readonly prisma: PrismaService, private readonly trigger: SystemTrigger) {}
  dispatched(caseId: string) {
    if (this.pending.has(caseId)) return;
    const timer = setTimeout(() => {
      void this.deliver(caseId).catch((error: unknown) => {
        // Never log credentials, signed URLs or PDF contents.
        const reason = error instanceof Error && /^(Delivery pipeline|POD S3 upload)/.test(error.message) ? error.message : (error instanceof Error ? error.name : "UnknownError");
        this.logger.error(`Simulated delivery failed for case ${caseId}: ${reason}; case remains dispatched`);
      }).finally(() => this.pending.delete(caseId));
    }, 3000);
    timer.unref();
    this.pending.set(caseId, timer);
  }
  onModuleDestroy() {
    for (const timer of this.pending.values()) clearTimeout(timer);
    this.pending.clear();
  }
  private async deliver(caseId: string) {
    // Read only. The HTTP handlers own every write and lifecycle transition.
    const db = await this.prisma.getClient();
    const record = await db.case.findFirst({where: {id: caseId, service_code: 'legal_notice', status: 'dispatched'}});
    if (!record) return;
    const base = `http://127.0.0.1:${process.env.PORT}/api/v1`;
    const post = async (path: string, body: unknown, headers: Record<string, string> = {}) => {
      const response = await fetch(base + path, {method: 'POST', headers: {'Content-Type': 'application/json', ...headers}, body: JSON.stringify(body)});
      if (!response.ok) throw new Error(`Delivery pipeline ${path}: HTTP ${response.status}`);
      return response.json();
    };
    const session = z.object({user: z.object({id: z.uuid(), role: z.literal('admin')}), tokens: z.object({idToken: z.string().min(1)})}).parse(
      await post('/auth/login', {email: 'demo-admin@legalitt.invalid', password: await demoPassword()}),
    );
    const ticket = this.trigger.issue(session.user.id, caseId);
    const headers = {Authorization: `Bearer ${session.tokens.idToken}`, 'X-System-Trigger': ticket};
    try {
      const bytes = await simulatedProof(record.reference, new Date());
      const signed = z.object({document: z.object({id: z.uuid()}), upload: z.object({url: z.url(), fields: z.record(z.string(), z.string())})}).parse(
        await post('/documents/presign', {case_id: caseId, kind: 'proof_of_delivery', filename: 'simulated-proof-of-delivery.pdf', mime: 'application/pdf'}, headers),
      );
      this.trigger.document(ticket, signed.document.id);
      const form = new FormData();
      for (const [key, value] of Object.entries(signed.upload.fields)) form.append(key, value);
      form.append('file', new Blob([Buffer.from(bytes)], {type: 'application/pdf'}), 'simulated-proof-of-delivery.pdf');
      const upload = await fetch(signed.upload.url, {method: 'POST', body: form});
      if (!upload.ok) throw new Error(`POD S3 upload: HTTP ${upload.status}`);
      await post(`/documents/${signed.document.id}/complete`, {}, headers);
      await post(`/cases/${caseId}/delivered`, {pod_document_id: signed.document.id}, headers);
    } finally { this.trigger.revoke(ticket); }
  }
}
