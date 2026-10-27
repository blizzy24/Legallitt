import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  DOCUMENT_MAX_BYTES,
  DOCUMENT_URL_SECONDS,
  DocumentMimeSchema,
  DocumentPresignSchema,
  ID_PROOF_NOTICE,
} from "@legalitt/shared";
import type { Prisma, Document } from "../generated/prisma/client";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import { caseScope, type CaseActor } from "../cases/case-access";
import { lockedCase } from "../cases/case-state-machine";
import { DocumentStorage, stagingKey } from "./document-storage";
import { FileInspector } from "./file-inspector";

const transactionOptions = { timeout: 60_000 };
@Injectable()
export class DocumentService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private cleanupRunning = false;
  private readonly logger = new Logger(DocumentService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: DocumentStorage,
    private readonly inspector: FileInspector,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.cleanupAbandoned().catch(() =>
        this.logger.warn("Document cleanup failed; will retry"),
      );
    }, 300_000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async locked(
    tx: Prisma.TransactionClient,
    actor: CaseActor,
    id: string,
  ) {
    await tx.$queryRaw`SELECT d.id FROM documents d JOIN cases c ON c.id = d.case_id
      WHERE d.id = ${id}::uuid AND c.service_code = 'legal_notice'
      AND (${actor.role} = 'admin'
        OR (${actor.role} = 'client' AND c.client_id = ${actor.id}::uuid)
        OR (${actor.role} = 'advocate' AND c.advocate_id = ${actor.id}::uuid))
      FOR UPDATE OF d, c`;
    const doc = await tx.document.findFirst({
      where: { id, case_id_relation: { is: caseScope(actor) } },
    });
    if (!doc) throw new NotFoundException("Document not found");
    return doc;
  }
  private publicRecord(doc: Document) {
    return {
      ...doc,
      size_bytes: doc.size_bytes.toString(),
      ...(doc.kind === "id_proof" ? { identity_notice: ID_PROOF_NOTICE } : {}),
    };
  }
  async presign(actor: CaseActor, body: unknown) {
    const input = parse(DocumentPresignSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      await lockedCase(tx, actor, input.case_id);
      const id = randomUUID();
      const key = `cases/${input.case_id}/${id}/${input.filename}`;
      const doc = await tx.document.create({
        data: {
          id,
          case_id: input.case_id,
          owner_id: actor.id,
          simulated: actor.source === "simulated",
          kind: input.kind,
          filename: input.filename,
          s3_key: key,
          mime_type: input.mime,
          size_bytes: 0n,
          status: "pending",
        },
      });
      const upload = await this.storage.upload(key, input.mime);
      return {
        document: this.publicRecord(doc),
        ...(doc.simulated ? {simulated: true} : {}),
        upload: {
          ...upload,
          method: "POST",
          expires_in: DOCUMENT_URL_SECONDS,
          max_bytes: DOCUMENT_MAX_BYTES,
        },
      };
    }, transactionOptions);
  }
  async complete(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const doc = await this.locked(tx, actor, id);
      if (doc.status === "uploaded") return this.publicRecord(doc);
      if (doc.status !== "pending")
        throw new NotFoundException("Document not found");
      const key = stagingKey(doc.s3_key);
      const info = await this.storage.head(key);
      if (!info)
        throw new ConflictException("Upload is not present in storage");
      try {
        if (
          !DocumentMimeSchema.safeParse(info.mime).success ||
          info.size < 1 ||
          info.size > DOCUMENT_MAX_BYTES
        )
          throw new BadRequestException(
            "File exceeds the upload limits or has an unsupported type",
          );
        const bytes = await this.storage.read(key, info);
        const actual = await this.inspector.inspect(bytes);
        if (actual.mime !== info.mime)
          throw new BadRequestException(
            "File type does not match its storage metadata",
          );
        await this.storage.promote(doc.s3_key, info, actual.mime);
        const updated = await tx.document.update({
          where: { id },
          data: {
            mime_type: actual.mime,
            size_bytes: BigInt(info.size),
            page_count: actual.pageCount,
            status: "uploaded",
          },
        });
        return this.publicRecord(updated);
      } catch (error) {
        // Invalid content stays unavailable. Delete only the inspected version so
        // a concurrent retry is not removed. No raw file/error contents are logged.
        if (error instanceof BadRequestException)
          await this.storage.discard(key, info);
        throw error;
      }
    }, transactionOptions);
  }
  async url(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const doc = await this.locked(tx, actor, id);
      if (doc.status !== "uploaded")
        throw new NotFoundException("Document not found");
      return {
        url: await this.storage.download(doc.s3_key, doc.filename),
        ...(doc.simulated ? {simulated: true} : {}),
        expires_in: DOCUMENT_URL_SECONDS,
      };
    }, transactionOptions);
  }
  async delete(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    const doc = await db.$transaction(async (tx) => {
      const record = await this.locked(tx, actor, id);
      if (actor.role !== "admin" && record.owner_id !== actor.id)
        throw new ForbiddenException(
          "Only the uploader or admin may delete evidence",
        );
      // Tombstone first: if S3 is unavailable, new downloads are still blocked
      // and the scheduled sweep retries physical deletion. Preserve FK history.
      return tx.document.update({ where: { id }, data: { status: "deleted" } });
    }, transactionOptions);
    try {
      await this.purge(doc);
    } catch {
      this.logger.warn("Document deletion will be retried by cleanup");
    }
    return { deleted: true };
  }
  private async purge(doc: Document) {
    await this.storage.remove(doc.s3_key);
    await this.storage.remove(stagingKey(doc.s3_key));
  }
  async cleanupAbandoned(now = new Date()) {
    if (this.cleanupRunning) return;
    this.cleanupRunning = true;
    try {
      const db = await this.prisma.getClient();
      const cutoff = new Date(now.getTime() - 3_600_000);
      let cursor: string | undefined;
      for (;;) {
        const rows = await db.document.findMany({
          where: {
            ...(cursor ? { id: { gt: cursor } } : {}),
            OR: [
              { status: "pending", created_at: { lt: cutoff } },
              { status: "uploaded", created_at: { lt: cutoff } },
              { status: "deleted" },
            ],
          },
          orderBy: { id: "asc" },
          take: 100,
        });
        if (!rows.length) break;
        for (const row of rows) {
          await db.$transaction(async (tx) => {
            const locks = await tx.$queryRaw<
              { id: string }[]
            >`SELECT id FROM documents WHERE id = ${row.id}::uuid FOR UPDATE SKIP LOCKED`;
            if (!locks.length) return;
            const current = await tx.document.findUnique({
              where: { id: row.id },
            });
            if (!current) return;
            if (current.status === "pending" && current.created_at < cutoff) {
              if (
                !(await this.storage.head(stagingKey(current.s3_key))) &&
                !(await this.storage.head(current.s3_key))
              )
                await tx.document.delete({ where: { id: current.id } });
            } else if (
              current.status === "uploaded" &&
              current.created_at < cutoff
            ) {
              // Upload URLs expired long ago; discard superseded temporary versions.
              await this.storage.remove(stagingKey(current.s3_key));
            } else if (current.status === "deleted") await this.purge(current);
          }, transactionOptions);
        }
        cursor = rows.at(-1)!.id;
        if (rows.length < 100) break;
      }
    } finally {
      this.cleanupRunning = false;
    }
  }
}
