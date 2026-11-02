const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { PDFDocument } = require("pdf-lib");
const { DocumentService } = require("../dist/src/documents/document.service");
const { FileInspector } = require("../dist/src/documents/file-inspector");
const {
  DocumentStorage,
  stagingKey,
} = require("../dist/src/documents/document-storage");
const {
  DocumentPresignSchema,
  DOCUMENT_MAX_BYTES,
} = require("@legalitt/shared");
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4AWP4DwQACfsD/c8LaHIAAAAASUVORK5CYII=",
  "base64",
);
const jpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A/fyiiigD/9k=",
  "base64",
);
class Storage {
  objects = new Map();
  promotions = 0;
  reads = 0;
  downloads = 0;
  put(key, bytes, mime = "application/pdf", size = bytes.length) {
    this.objects.set(key, {
      bytes,
      size,
      mime,
      version: randomUUID(),
      etag: "test",
    });
  }
  async upload(key) {
    return { url: "https://storage.invalid", fields: { key: stagingKey(key) } };
  }
  async head(key) {
    return this.objects.get(key) ?? null;
  }
  async read(key) {
    this.reads++;
    return this.objects.get(key).bytes;
  }
  async promote(key, info) {
    this.promotions++;
    this.objects.set(key, { ...this.objects.get(stagingKey(key)) });
  }
  async download(key) {
    this.downloads++;
    return "https://storage.invalid/" + key;
  }
  async discard(key, info) {
    if (this.objects.get(key)?.version === info.version)
      this.objects.delete(key);
  }
  async remove(key) {
    this.objects.delete(key);
  }
}
test("document input rejects path traversal, unsupported types, identity numbers and client-controlled metadata", () => {
  const input = {
    case_id: randomUUID(),
    kind: "id_proof",
    filename: "evidence.pdf",
    mime: "application/pdf",
  };
  assert.ok(DocumentPresignSchema.safeParse(input).success);
  for (const change of [
    { filename: "../x.pdf" },
    { filename: "${filename}.pdf" },
    { filename: "1234-5678-9012.pdf" },
    { mime: "application/x-msdownload" },
    { size_bytes: 1 },
    { s3_key: "other" },
    { page_count: 1 },
  ])
    assert.equal(
      DocumentPresignSchema.safeParse({ ...input, ...change }).success,
      false,
    );
});
test("structural inspection counts PDFs and images and rejects non-documents", async () => {
  const inspector = new FileInspector();
  const pdf = await PDFDocument.create();
  pdf.addPage();
  pdf.addPage();
  pdf.addPage();
  assert.deepEqual(await inspector.inspect(await pdf.save()), {
    mime: "application/pdf",
    pageCount: 3,
  });
  assert.deepEqual(await inspector.inspect(png), {
    mime: "image/png",
    pageCount: 1,
  });
  assert.deepEqual(await inspector.inspect(jpeg), {
    mime: "image/jpeg",
    pageCount: 1,
  });
  for (const bytes of [
    Buffer.from("MZ executable"),
    Buffer.from("%PDF-1.7 broken"),
    Buffer.alloc(0),
  ])
    await assert.rejects(inspector.inspect(bytes), { status: 400 });
});
test("S3 policies constrain size/type/key; reads pin versions; deletion purges exact-key versions", async () => {
  const storage = new DocumentStorage();
  storage.configuration = Promise.resolve({ bucketName: "test-documents" });
  storage.s3.config.credentials = async () => ({
    accessKeyId: "test",
    secretAccessKey: "test",
  });
  const key = "cases/case/document/evidence.pdf";
  const upload = await storage.upload(key, "application/pdf");
  const policy = JSON.parse(
    Buffer.from(upload.fields.Policy, "base64").toString(),
  );
  assert.ok(
    policy.conditions.some(
      (c) =>
        JSON.stringify(c) ===
        JSON.stringify(["content-length-range", 1, 25_000_000]),
    ),
  );
  assert.ok(
    policy.conditions.some(
      (c) =>
        JSON.stringify(c) ===
        JSON.stringify(["eq", "$Content-Type", "application/pdf"]),
    ),
  );
  assert.equal(upload.fields.key, stagingKey(key));
  assert.ok(new Date(policy.expiration) - Date.now() <= 300_000);
  const url = new URL(await storage.download(key, "evidence.pdf"));
  assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
  const calls = [];
  storage.s3.send = async (cmd) => {
    calls.push(cmd);
    if (cmd.constructor.name === "GetObjectCommand")
      return {
        Body: (async function* () {
          yield Buffer.from("abc");
        })(),
      };
    if (cmd.constructor.name === "ListObjectVersionsCommand")
      return {
        Versions: [
          { Key: key, VersionId: "v1" },
          { Key: key + "-other", VersionId: "v2" },
        ],
        DeleteMarkers: [{ Key: key, VersionId: "v3" }],
      };
    return {};
  };
  assert.equal(
    (
      await storage.read(key, { size: 3, version: "v1", etag: "etag" })
    ).toString(),
    "abc",
  );
  assert.equal(calls[0].input.VersionId, "v1");
  assert.equal(calls[0].input.IfMatch, "etag");
  await assert.rejects(storage.read(key, { size: 2 }), { status: 400 });
  await assert.rejects(storage.read(key, { size: 2_000_000_000 }), {
    status: 400,
  });
  await storage.promote(
    key,
    { size: 3, version: "version with space", etag: "etag" },
    "application/pdf",
  );
  const copy = calls.find(
    (c) => c.constructor.name === "CopyObjectCommand",
  ).input;
  assert.match(copy.CopySource, /versionId=version%20with%20space$/);
  assert.equal(copy.CopySourceIfMatch, "etag");
  await storage.remove(key);
  assert.deepEqual(
    calls
      .filter((c) => c.constructor.name === "DeleteObjectCommand")
      .map((c) => c.input.VersionId),
    ["v1", "v3"],
  );
  storage.s3.send = async () => {
    throw { $metadata: { httpStatusCode: 403 } };
  };
  await assert.rejects(storage.head(key));
  storage.s3.send = async () => {
    throw { $metadata: { httpStatusCode: 404 } };
  };
  assert.equal(await storage.head(key), null);
  storage.s3.destroy();
});
test(
  "document authorization, completion, identity evidence and cleanup on PostgreSQL",
  { skip: !process.env.LEGALITT_TEST_DATABASE_URL },
  async (t) => {
    const { PrismaClient } = require("../dist/src/generated/prisma/client");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.LEGALITT_TEST_DATABASE_URL,
      }),
    });
    const actors = ["client", "client", "advocate", "advocate", "admin"].map(
      (role) => ({ id: randomUUID(), role }),
    );
    const [client, other, advocate, otherAdvocate, admin] = actors;
    const caseId = randomUUID();
    const storage = new Storage();
    const service = new DocumentService(
      { getClient: async () => db },
      storage,
      new FileInspector(),
    );
    const presign = (
      actor = client,
      kind = "evidence",
      mime = "application/pdf",
    ) =>
      service.presign(actor, {
        case_id: caseId,
        kind,
        filename: mime === "image/png" ? "evidence.png" : "evidence.pdf",
        mime,
      });
    try {
      for (const actor of actors)
        await db.user.create({
          data: {
            ...actor,
            cognito_sub: "documents-" + actor.id,
            full_name: "Test identity",
          },
        });
      await db.case.create({
        data: {
          id: caseId,
          reference: "TEST-" + caseId,
          service_code: "legal_notice",
          client_id: client.id,
          advocate_id: advocate.id,
          status: "draft",
          details: {},
        },
      });
      await t.test(
        "unrelated clients and advocates cannot create or read evidence",
        async () => {
          for (const actor of [other, otherAdvocate])
            await assert.rejects(presign(actor), { status: 404 });
          assert.equal(
            await db.document.count({ where: { case_id: caseId } }),
            0,
          );
        },
      );
      const pdf = await PDFDocument.create();
      pdf.addPage();
      pdf.addPage();
      const bytes = await pdf.save();
      let uploaded;
      await t.test(
        "ID proof uses real size and structural page count; concurrent completion is idempotent",
        async () => {
          const signed = await presign(client, "id_proof");
          const d = signed.document;
          assert.equal(d.status, "pending");
          assert.match(d.identity_notice, /masked only/);
          await assert.rejects(service.complete(client, d.id), { status: 409 });
          storage.put(stagingKey(d.s3_key), bytes);
          const results = await Promise.all([
            service.complete(client, d.id),
            service.complete(client, d.id),
          ]);
          assert.equal(storage.promotions, 1);
          for (const result of results) {
            assert.equal(result.page_count, 2);
            assert.equal(result.size_bytes, String(bytes.length));
            assert.equal(result.status, "uploaded");
          }
          uploaded = d;
          for (const actor of [client, advocate, admin])
            assert.equal((await service.url(actor, d.id)).expires_in, 300);
          const before = storage.downloads;
          for (const actor of [other, otherAdvocate])
            await assert.rejects(service.url(actor, d.id), { status: 404 });
          assert.equal(storage.downloads, before);
          storage.put(stagingKey(d.s3_key), Buffer.from("MZ replay"));
          assert.deepEqual(storage.objects.get(d.s3_key).bytes, bytes);
          assert.equal((await service.complete(client, d.id)).page_count, 2);
        },
      );
      await t.test("admin-owned POD is readable through case membership, never ownership", async () => {
        const { simulatedProof } = require("../dist/src/admin-ui/simulated-proof");
        const proof = await simulatedProof("TEST-POD", new Date("2026-10-27T00:00:00Z"));
        const signed = await presign(admin, "proof_of_delivery");
        assert.equal(signed.document.owner_id, admin.id);
        storage.put(stagingKey(signed.document.s3_key), proof);
        const completed = await service.complete(admin, signed.document.id);
        assert.equal(completed.page_count, 1);
        for (const actor of [client, advocate, admin])
          assert.equal((await service.url(actor, completed.id)).expires_in, 300);
        const downloads = storage.downloads;
        for (const actor of [other, otherAdvocate])
          await assert.rejects(service.url(actor, completed.id), { status: 404 });
        assert.equal(storage.downloads, downloads);
      });
      await t.test(
        "PNG counts one; malformed, mismatched and oversized objects are refused",
        async () => {
          const signed = await presign(advocate, "evidence", "image/png");
          storage.put(stagingKey(signed.document.s3_key), png, "image/png");
          assert.equal(
            (await service.complete(advocate, signed.document.id)).page_count,
            1,
          );
          for (const [content, mime, size] of [
            [Buffer.from("MZ executable"), "application/pdf", 13],
            [png, "application/pdf", png.length],
            [png, "image/png", 2_000_000_000],
          ]) {
            const { document: d } = await presign();
            storage.put(stagingKey(d.s3_key), content, mime, size);
            const before = storage.reads;
            await assert.rejects(service.complete(client, d.id), {
              status: 400,
            });
            if (size > DOCUMENT_MAX_BYTES) assert.equal(storage.reads, before);
            assert.equal(
              (await db.document.findUnique({ where: { id: d.id } })).status,
              "pending",
            );
            assert.equal(storage.objects.has(stagingKey(d.s3_key)), false);
            await assert.rejects(service.url(client, d.id), { status: 404 });
          }
        },
      );
      await t.test(
        "deletion requires uploader/admin and blocks new downloads before retrying storage",
        async () => {
          await assert.rejects(service.delete(advocate, uploaded.id), {
            status: 403,
          });
          const remove = storage.remove;
          storage.remove = async () => {
            throw Error("storage unavailable");
          };
          assert.deepEqual(await service.delete(client, uploaded.id), {
            deleted: true,
          });
          await assert.rejects(service.url(client, uploaded.id), {
            status: 404,
          });
          storage.remove = remove;
          await service.cleanupAbandoned();
          assert.equal(storage.objects.has(uploaded.s3_key), false);
        },
      );
      await t.test(
        "abandoned cleanup handles more than one batch and preserves recent or present objects",
        async () => {
          const old = new Date(Date.now() - 7_200_000);
          const data = Array.from({ length: 101 }, () => {
            const id = randomUUID();
            return {
              id,
              case_id: caseId,
              owner_id: client.id,
              kind: "evidence",
              filename: "evidence.pdf",
              s3_key: `cases/${caseId}/${id}/evidence.pdf`,
              mime_type: "application/pdf",
              size_bytes: 0n,
              status: "pending",
              created_at: old,
            };
          });
          await db.document.createMany({ data });
          const recent = (await presign()).document;
          const present = (await presign()).document;
          await db.document.update({
            where: { id: present.id },
            data: { created_at: old },
          });
          storage.put(stagingKey(present.s3_key), bytes);
          await service.cleanupAbandoned();
          assert.equal(
            await db.document.count({
              where: { id: { in: data.map((d) => d.id) } },
            }),
            0,
          );
          for (const id of [recent.id, present.id])
            assert.ok(await db.document.findUnique({ where: { id } }));
        },
      );
      await t.test(
        "HTTP routes enforce authentication, scoped access and strict request bodies",
        async () => {
          require("reflect-metadata");
          const { NestFactory } = require("@nestjs/core");
          const { AppModule } = require("../dist/src/app.module");
          const { PrismaService } = require("../dist/src/prisma.service");
          const { AuthService } = require("../dist/src/auth/auth.service");
          const app = await NestFactory.create(AppModule, { logger: false });
          app.get(PrismaService).getClient = async () => db;
          app.get(AuthService).identity = async (token) => {
            const a = actors.find((a) => a.id === token);
            if (!a)
              throw new (require("@nestjs/common").UnauthorizedException)();
            return a;
          };
          for (const method of [
            "upload",
            "head",
            "read",
            "promote",
            "download",
            "discard",
            "remove",
          ])
            app.get(DocumentStorage)[method] = storage[method].bind(storage);
          try {
            await app.listen(0, "127.0.0.1");
            const base = await app.getUrl();
            const call = async (method, path, actor, body) => {
              const r = await fetch(base + "/api/v1/documents" + path, {
                method,
                headers: {
                  "Content-Type": "application/json",
                  ...(actor ? { Authorization: "Bearer " + actor.id } : {}),
                },
                ...(body === undefined ? {} : { body: JSON.stringify(body) }),
              });
              return { status: r.status, body: await r.json() };
            };
            const input = {
              case_id: caseId,
              kind: "evidence",
              filename: "evidence.png",
              mime: "image/png",
            };
            assert.equal(
              (await call("POST", "/presign", null, input)).status,
              401,
            );
            assert.equal(
              (await call("POST", "/presign", other, input)).status,
              404,
            );
            assert.equal(
              (
                await call("POST", "/presign", client, {
                  ...input,
                  size_bytes: 1,
                })
              ).status,
              400,
            );
            const created = await call("POST", "/presign", client, input);
            assert.equal(created.status, 201);
            const d = created.body.document;
            storage.put(stagingKey(d.s3_key), png, "image/png");
            assert.equal(
              (
                await call("POST", "/" + d.id + "/complete", client, {
                  page_count: 100,
                })
              ).status,
              400,
            );
            assert.equal(
              (await call("POST", "/" + d.id + "/complete", client, {})).body
                .page_count,
              1,
            );
            assert.equal(
              (await call("GET", "/" + d.id + "/url", other)).status,
              404,
            );
            assert.equal(
              (await call("GET", "/" + d.id + "/url", advocate)).status,
              200,
            );
            assert.equal(
              (await call("DELETE", "/" + d.id, client)).status,
              200,
            );
            assert.equal(
              (await call("GET", "/" + d.id + "/url", client)).status,
              404,
            );
          } finally {
            await app.close();
          }
        },
      );
    } finally {
      // Inbox rows reference users independently of the document case.
      await db.notification.deleteMany({where:{user_id:{in:actors.map(a=>a.id)}}});
      await db.document.deleteMany({ where: { case_id: caseId } });
      await db.case.deleteMany({ where: { id: caseId } });
      await db.user.deleteMany({
        where: { id: { in: actors.map((a) => a.id) } },
      });
      await db.$disconnect();
    }
  },
);
