// Explicit live test: synthetic files only, local DB, existing Dev S3 bucket.
require("reflect-metadata");
const assert = require("node:assert/strict");
const { NestFactory } = require("@nestjs/core");
const { PDFDocument } = require("pdf-lib");
const { AppModule } = require("../dist/src/app.module");
const { PrismaService } = require("../dist/src/prisma.service");
const { DocumentService } = require("../dist/src/documents/document.service");
const {
  DocumentStorage,
  stagingKey,
} = require("../dist/src/documents/document-storage");
(async () => {
  if (
    process.env.ENVIRONMENT !== "dev" ||
    !/^postgres(?:ql)?:\/\/[^/]+@(localhost|127\.0\.0\.1):/.test(
      process.env.DATABASE_URL ?? "",
    )
  )
    throw Error("Dev configuration and a local database required");
  const app = await NestFactory.create(AppModule, { logger: false });
  let caseId;
  let client;
  try {
    await app.listen(0, "127.0.0.1");
    const base = await app.getUrl();
    const call = async (method, path, token, body) => {
      const r = await fetch(base + "/api/v1" + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      return { status: r.status, body: await r.json() };
    };
    const login = async (role) => {
      const r = await call("POST", "/auth/otp/verify", null, {
        phone: "ignored",
        code: "123456",
        role,
      });
      assert.equal(r.status, 201);
      return r.body;
    };
    client = await login("client");
    const advocate = await login("advocate");
    const token = client.tokens.idToken;
    const created = await call("POST", "/cases", token, {
      service_code: "legal_notice",
    });
    assert.equal(created.status, 201);
    caseId = created.body.id;
    const pdf = await PDFDocument.create();
    pdf.addPage();
    pdf.addPage();
    const bytes = await pdf.save();
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4AWP4DwQACfsD/c8LaHIAAAAASUVORK5CYII=",
      "base64",
    );
    const upload = async (signed, content, mime) => {
      const form = new FormData();
      for (const [k, v] of Object.entries(signed.fields)) form.append(k, v);
      form.append("file", new Blob([content], { type: mime }), "synthetic");
      return fetch(signed.url, { method: "POST", body: form });
    };
    for (const [content, mime, filename, kind, pages] of [
      [bytes, "application/pdf", "synthetic.pdf", "id_proof", 2],
      [png, "image/png", "synthetic.png", "evidence", 1],
    ]) {
      const signed = await call("POST", "/documents/presign", token, {
        case_id: caseId,
        kind,
        filename,
        mime,
      });
      assert.equal(signed.status, 201);
      const d = signed.body.document;
      assert.equal(
        (await upload(signed.body.upload, content, mime)).status,
        204,
      );
      const complete = await call(
        "POST",
        `/documents/${d.id}/complete`,
        token,
        {},
      );
      assert.equal(complete.status, 201);
      assert.equal(complete.body.page_count, pages);
      assert.equal(complete.body.size_bytes, String(content.length));
      const download = await call("GET", `/documents/${d.id}/url`, token);
      assert.equal(download.status, 200);
      const url = new URL(download.body.url);
      assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
      const response = await fetch(url);
      assert.equal(response.status, 200);
      assert.deepEqual(
        Buffer.from(await response.arrayBuffer()),
        Buffer.from(content),
      );
      assert.equal(
        response.headers.get("x-amz-server-side-encryption"),
        "aws:kms",
      );
      const anonymous = new URL(url);
      anonymous.search = "";
      assert.equal((await fetch(anonymous)).status, 403);
      assert.equal(
        (await call("GET", `/documents/${d.id}/url`, advocate.tokens.idToken))
          .status,
        404,
      );
      assert.equal(
        (
          await upload(
            signed.body.upload,
            Buffer.from("MZ invalid replay"),
            mime,
          )
        ).status,
        204,
      );
      assert.deepEqual(
        Buffer.from(await (await fetch(url)).arrayBuffer()),
        Buffer.from(content),
      );
      assert.equal(
        (await call("DELETE", `/documents/${d.id}`, token)).status,
        200,
      );
      assert.equal((await fetch(url)).status, 404);
      assert.equal(
        (await call("GET", `/documents/${d.id}/url`, token)).status,
        404,
      );
      console.log(
        `${mime}: upload, ${pages} page(s), KMS, private download, unrelated-user refusal, replay protection, deletion passed`,
      );
    }
    const oversized = await call("POST", "/documents/presign", token, {
      case_id: caseId,
      kind: "evidence",
      filename: "synthetic.pdf",
      mime: "application/pdf",
    });
    const tooLarge = await upload(
      oversized.body.upload,
      new Uint8Array(25_000_001),
      "application/pdf",
    );
    assert.equal(tooLarge.status, 400);
    assert.match(await tooLarge.text(), /EntityTooLarge/);
    assert.equal(
      await app
        .get(DocumentStorage)
        .head(stagingKey(oversized.body.document.s3_key)),
      null,
    );
    console.log("S3 rejected 25,000,001 bytes before storage");
    const invalid = await call("POST", "/documents/presign", token, {
      case_id: caseId,
      kind: "evidence",
      filename: "synthetic.pdf",
      mime: "application/pdf",
    });
    assert.equal(
      (
        await upload(
          invalid.body.upload,
          Buffer.from("MZ executable"),
          "application/pdf",
        )
      ).status,
      204,
    );
    assert.equal(
      (
        await call(
          "POST",
          `/documents/${invalid.body.document.id}/complete`,
          token,
          {},
        )
      ).status,
      400,
    );
    assert.equal(
      await app
        .get(DocumentStorage)
        .head(stagingKey(invalid.body.document.s3_key)),
      null,
    );
    console.log(
      "Executable with PDF MIME label rejected and uploaded version removed",
    );
  } finally {
    if (caseId) {
      const db = await app.get(PrismaService).getClient();
      for (const doc of await db.document.findMany({
        where: { case_id: caseId },
      })) {
        await app.get(DocumentService).delete(client.user, doc.id);
        const storage = app.get(DocumentStorage);
        assert.equal(await storage.head(doc.s3_key), null);
        assert.equal(await storage.head(stagingKey(doc.s3_key)), null);
      }
      await db.document.deleteMany({ where: { case_id: caseId } });
      await db.caseEvent.deleteMany({ where: { case_id: caseId } });
      await db.case.delete({ where: { id: caseId } });
      console.log("Synthetic case, document rows and S3 objects removed");
    }
    await app.close();
  }
})().catch((error) => {
  console.error(error.name + ": " + error.message);
  process.exitCode = 1;
});
