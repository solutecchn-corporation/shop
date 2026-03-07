import { supabase, SUPABASE_URL } from "./supabase";

const ABSOLUTE_URL_REGEX = /^(https?:|data:|blob:)/i;

function parseStoragePath(imageValue) {
  const value = String(imageValue || "").trim();
  if (!value) return null;

  if (ABSOLUTE_URL_REGEX.test(value) || value.startsWith("/")) {
    return null;
  }

  const [bucket, ...rest] = value.split("/").filter(Boolean);
  if (!bucket || rest.length === 0) {
    return null;
  }

  return {
    bucket,
    path: rest.join("/"),
  };
}

function buildPublicStorageUrl(bucket, path) {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export function resolveProductImageCandidates(imageValue) {
  if (!imageValue) return [];

  const value = String(imageValue).trim();
  if (!value) return [];

  if (ABSOLUTE_URL_REGEX.test(value) || value.startsWith("/")) {
    return [value];
  }

  if (value.startsWith("storage/v1/object/public/")) {
    return [`${SUPABASE_URL}/${value}`];
  }

  if (value.startsWith("/storage/v1/object/public/")) {
    return [`${SUPABASE_URL}${value}`];
  }

  if (value.includes("/storage/v1/object/public/")) {
    return [value];
  }

  const storageTarget = parseStoragePath(value);
  if (!storageTarget) {
    return [value];
  }

  const candidates = [
    buildPublicStorageUrl(storageTarget.bucket, storageTarget.path),
  ];

  if (!storageTarget.path.startsWith(`${storageTarget.bucket}/`)) {
    candidates.push(
      buildPublicStorageUrl(
        storageTarget.bucket,
        `${storageTarget.bucket}/${storageTarget.path}`,
      ),
    );
  }

  const { data } = supabase.storage
    .from(storageTarget.bucket)
    .getPublicUrl(storageTarget.path);
  if (data?.publicUrl) {
    candidates.unshift(data.publicUrl);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

export function resolveProductImage(imageValue) {
  return resolveProductImageCandidates(imageValue)[0] || "";
}

export async function resolveProductImageUrl(imageValue) {
  return resolveProductImage(imageValue);
}
