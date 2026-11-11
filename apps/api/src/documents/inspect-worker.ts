import { parentPort, workerData } from "node:worker_threads";
import { PDFDocument } from "pdf-lib";
import { imageSize } from "image-size";

(async () => {
  const { fileTypeFromBuffer } = await import("file-type");
  const bytes = new Uint8Array(workerData);
  const type = await fileTypeFromBuffer(bytes);
  if (
    !type ||
    !["application/pdf", "image/jpeg", "image/png", "video/mp4", "audio/mpeg"].includes(type.mime)
  )
    throw new Error("Unsupported file structure");
  // Media is identified by its container signature only; it is never decoded.
  if (type.mime === "video/mp4" || type.mime === "audio/mpeg") {
    parentPort!.postMessage({ mime: type.mime, pageCount: null });
    return;
  }
  let pageCount = 1;
  if (type.mime === "application/pdf") {
    // Only the page tree is inspected. No getForm, text extraction, OCR,
    // identity fields or content-stream processing is requested.
    const pdf = await PDFDocument.load(bytes, {
      updateMetadata: false,
      ignoreEncryption: false,
      throwOnInvalidObject: true,
    });
    pageCount = pdf.getPageCount();
    if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > 2147483647)
      throw new Error("Invalid page count");
  } else {
    const dimensions = imageSize(bytes);
    if (
      !dimensions.width ||
      !dimensions.height ||
      !["jpg", "png"].includes(dimensions.type ?? "")
    )
      throw new Error("Invalid image structure");
  }
  parentPort!.postMessage({ mime: type.mime, pageCount });
})().catch(() =>
  parentPort!.postMessage({ error: "Invalid document structure" }),
);
