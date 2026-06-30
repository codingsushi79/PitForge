import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs/promises";

const R2_PREFIX = "r2:";

export function isR2Storage(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function getBucket(): string {
  return process.env.R2_BUCKET_NAME!;
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  if (
    body &&
    typeof body === "object" &&
    "transformToByteArray" in body &&
    typeof (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray === "function"
  ) {
    return Buffer.from(await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray());
  }
  throw new Error("Unsupported response body type");
}

export async function uploadFile(
  key: string,
  data: Buffer,
  contentType = "application/octet-stream"
): Promise<string> {
  if (isR2Storage()) {
    const objectKey = `setups/${key}`;
    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: objectKey,
        Body: data,
        ContentType: contentType,
      })
    );
    return `${R2_PREFIX}${objectKey}`;
  }

  const uploadDir = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, key);
  await fs.writeFile(filePath, data);
  return key;
}

export async function downloadFile(storedPath: string): Promise<Buffer> {
  if (storedPath.startsWith(R2_PREFIX)) {
    const objectKey = storedPath.slice(R2_PREFIX.length);
    const client = getR2Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: objectKey,
      })
    );
    if (!response.Body) throw new Error("Empty object from R2");
    return streamToBuffer(response.Body);
  }

  // Legacy: Vercel Blob public URLs
  if (storedPath.startsWith("http")) {
    const res = await fetch(storedPath);
    if (!res.ok) throw new Error("Failed to fetch file");
    return Buffer.from(await res.arrayBuffer());
  }

  const filePath = path.join(process.cwd(), "data", "uploads", storedPath);
  return fs.readFile(filePath);
}

export async function deleteFile(storedPath: string): Promise<void> {
  if (storedPath.startsWith(R2_PREFIX)) {
    const objectKey = storedPath.slice(R2_PREFIX.length);
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: objectKey,
      })
    );
    return;
  }

  if (storedPath.startsWith("http")) {
    return;
  }

  try {
    await fs.unlink(path.join(process.cwd(), "data", "uploads", storedPath));
  } catch {
    /* file may not exist */
  }
}

export function getStorageMode(): "r2" | "local" {
  return isR2Storage() ? "r2" : "local";
}

function normalizePublicBaseUrl(): string | null {
  const raw = process.env.R2_PUBLIC_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/** Public URL for an R2 object when R2_PUBLIC_URL is configured. */
export function getPublicFileUrl(storedPath: string): string | null {
  const base = normalizePublicBaseUrl();
  if (!base || !storedPath.startsWith(R2_PREFIX)) return null;
  const objectKey = storedPath.slice(R2_PREFIX.length);
  return `${base}/${objectKey}`;
}
