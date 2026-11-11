import { BadRequestException, Injectable } from "@nestjs/common";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { DOCUMENT_MEDIA_MAX_BYTES, DocumentMimeSchema } from "@legalitt/shared";
import { z } from "zod";

const resultSchema = z.strictObject({
  mime: DocumentMimeSchema,
  // Media (MP4 / MP3) has no pages.
  pageCount: z.number().int().min(1).max(2147483647).nullable(),
});
@Injectable()
export class FileInspector {
  inspect(bytes: Uint8Array): Promise<z.infer<typeof resultSchema>> {
    if (!bytes.length || bytes.length > DOCUMENT_MEDIA_MAX_BYTES)
      return Promise.reject(
        new BadRequestException("File exceeds the upload limits"),
      );
    return new Promise((resolve, reject) => {
      // Isolate malformed/compressed PDF work from the API event loop. A failed
      // parser has bounded time and V8 heap; never return parser input in errors.
      const worker = new Worker(join(__dirname, "inspect-worker.js"), {
        workerData: bytes,
        resourceLimits: { maxOldGenerationSizeMb: 128 },
        stdout: true,
        stderr: true,
      });
      // Third-party parser diagnostics must not put evidence content in logs.
      worker.stdout?.resume();
      worker.stderr?.resume();
      let settled = false;
      const finish = (result?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        void worker.terminate();
        const parsed = resultSchema.safeParse(result);
        if (parsed.success) resolve(parsed.data);
        else
          reject(
            new BadRequestException("File is not a valid supported document"),
          );
      };
      const timer = setTimeout(() => finish(), 10_000);
      worker.once("message", finish);
      worker.once("error", () => finish());
      worker.once("exit", () => finish());
    });
  }
}
