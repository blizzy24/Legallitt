import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectVersionsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DOCUMENT_URL_SECONDS, documentMaxBytes } from "@legalitt/shared";
import { z } from "zod";

export type ObjectInfo = {
  size: number;
  mime?: string;
  version?: string;
  etag?: string;
};
export function stagingKey(key: string) {
  const slash = key.lastIndexOf("/");
  return key.slice(0, slash + 1) + ".pending-" + key.slice(slash + 1);
}
@Injectable()
export class DocumentStorage {
  private readonly s3 = new S3Client({ region: "ap-south-1" });
  private configuration?: Promise<{ bucketName: string }>;
  private config() {
    if (!this.configuration)
      this.configuration = (async () => {
        if (process.env.DOCUMENT_BUCKET)
          return { bucketName: process.env.DOCUMENT_BUCKET };
        if (!process.env.AUTH_CONFIG_SECRET_ARN)
          throw new ServiceUnavailableException(
            "Document storage is not configured",
          );
        const secrets = new SecretsManagerClient({ region: "ap-south-1" });
        try {
          const value = await secrets.send(
            new GetSecretValueCommand({
              SecretId: process.env.AUTH_CONFIG_SECRET_ARN,
            }),
          );
          return z
            .object({ bucketName: z.string().min(1) })
            .parse(JSON.parse(value.SecretString ?? "{}"));
        } finally {
          secrets.destroy();
        }
      })().catch((error) => {
        this.configuration = undefined;
        throw error;
      });
    return this.configuration;
  }
  async upload(key: string, mime: string) {
    const { bucketName: Bucket } = await this.config();
    // POST policy enforces the limit at S3; a presigned PUT alone cannot impose
    // a content-length range. The destination bucket applies its default SSE-KMS.
    return createPresignedPost(this.s3, {
      Bucket,
      Key: stagingKey(key),
      Expires: DOCUMENT_URL_SECONDS,
      Fields: { "Content-Type": mime, success_action_status: "204" },
      Conditions: [
        ["content-length-range", 1, documentMaxBytes(mime)],
        ["eq", "$Content-Type", mime],
      ],
    });
  }
  async head(key: string): Promise<ObjectInfo | null> {
    const { bucketName: Bucket } = await this.config();
    try {
      const object = await this.s3.send(
        new HeadObjectCommand({ Bucket, Key: key }),
      );
      return {
        size: object.ContentLength ?? -1,
        mime: object.ContentType,
        version: object.VersionId,
        etag: object.ETag,
      };
    } catch (error) {
      if (
        (error as { $metadata?: { httpStatusCode?: number } }).$metadata
          ?.httpStatusCode === 404
      )
        return null;
      throw error; // Access denied/service errors are not evidence of absence.
    }
  }
  async read(key: string, info: ObjectInfo) {
    if (info.size < 1 || info.size > documentMaxBytes(info.mime))
      throw new BadRequestException("File exceeds the upload limits");
    const { bucketName: Bucket } = await this.config();
    const result = await this.s3.send(
      new GetObjectCommand({
        Bucket,
        Key: key,
        VersionId: info.version,
        IfMatch: info.etag,
      }),
    );
    if (!result.Body) throw new BadRequestException("Uploaded object is empty");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
        size += chunk.byteLength;
        if (size > documentMaxBytes(info.mime) || size > info.size)
          throw new BadRequestException("File exceeds the upload limits");
        chunks.push(chunk);
      }
      if (size !== info.size)
        throw new BadRequestException("Uploaded object changed");
      return Buffer.concat(chunks);
    } finally {
      (result.Body as { destroy?: () => void }).destroy?.();
    }
  }
  async promote(key: string, info: ObjectInfo, mime: string) {
    const { bucketName: Bucket } = await this.config();
    const source = `${Bucket}/${stagingKey(key).split("/").map(encodeURIComponent).join("/")}`;
    // Validate/read/copy the SAME S3 version, even if the temporary POST URL is
    // reused concurrently. Clients never receive a write URL for the final key.
    await this.s3.send(
      new CopyObjectCommand({
        Bucket,
        Key: key,
        CopySource:
          source +
          (info.version
            ? `?versionId=${encodeURIComponent(info.version)}`
            : ""),
        CopySourceIfMatch: info.etag,
        ContentType: mime,
        MetadataDirective: "REPLACE",
      }),
    );
  }
  async download(key: string, filename: string, inline = false) {
    const { bucketName: Bucket } = await this.config();
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket,
        Key: key,
        ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      }),
      { expiresIn: DOCUMENT_URL_SECONDS },
    );
  }
  async discard(key: string, info: ObjectInfo) {
    const { bucketName: Bucket } = await this.config();
    if (!info.version)
      throw new ServiceUnavailableException(
        "Versioned document storage is required",
      );
    await this.s3.send(
      new DeleteObjectCommand({ Bucket, Key: key, VersionId: info.version }),
    );
  }
  async remove(key: string) {
    const { bucketName: Bucket } = await this.config();
    // The Core bucket is versioned: deleting only the current key leaves private
    // evidence retrievable by old version IDs. Purge exact-key versions/markers.
    let KeyMarker: string | undefined;
    let VersionIdMarker: string | undefined;
    do {
      const page = await this.s3.send(
        new ListObjectVersionsCommand({
          Bucket,
          Prefix: key,
          KeyMarker,
          VersionIdMarker,
        }),
      );
      for (const object of [
        ...(page.Versions ?? []),
        ...(page.DeleteMarkers ?? []),
      ]) {
        if (object.Key === key && object.VersionId)
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket,
              Key: key,
              VersionId: object.VersionId,
            }),
          );
      }
      KeyMarker = page.IsTruncated ? page.NextKeyMarker : undefined;
      VersionIdMarker = page.IsTruncated ? page.NextVersionIdMarker : undefined;
    } while (KeyMarker);
  }
}
