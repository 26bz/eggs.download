import type { AllowedFileMap, MetaEntry, SyncResult, SyncTarget } from '#shared/types/sync';

const STORAGE_META_PREFIX = 'meta:';
const STORAGE_FILE_PREFIX = 'file:';

function isMetaEntry(value: unknown): value is MetaEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('etag' in value || 'lastModified' in value || 'syncedAt' in value)
  );
}

async function readStorageMeta(filename: string) {
  const storage = useStorage('cache');
  const raw = await storage.getItem(STORAGE_META_PREFIX + filename);
  if (!raw || typeof raw !== 'string') return undefined;
  const parsed: unknown = JSON.parse(raw);
  return isMetaEntry(parsed) ? parsed : undefined;
}

async function writeStorageMeta(filename: string, entry: MetaEntry) {
  const storage = useStorage('cache');
  await storage.setItem(`${STORAGE_META_PREFIX}${filename}`, JSON.stringify(entry));
}

async function readStorageFile(filename: string) {
  const storage = useStorage('cache');
  const b64 = await storage.getItem<string>(`${STORAGE_FILE_PREFIX}${filename}`);
  return b64 ? Buffer.from(b64, 'base64') : null;
}

async function writeStorageFile(filename: string, buffer: Buffer) {
  const storage = useStorage('cache');
  await storage.setItem(`${STORAGE_FILE_PREFIX}${filename}`, buffer.toString('base64'));
}

function buildHeaders(entry?: MetaEntry): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'eggsdownload-cache/1.0',
  };
  if (entry?.etag) headers['If-None-Match'] = entry.etag;
  if (entry?.lastModified) headers['If-Modified-Since'] = entry.lastModified;
  return headers;
}

function validateAllowList(target: SyncTarget, allowList?: AllowedFileMap) {
  if (!allowList) return;
  const allowedUrl = allowList[target.filename];
  if (!allowedUrl) {
    throw createError({ statusCode: 404, statusMessage: 'File not allowlisted' });
  }
  if (allowedUrl !== target.url) {
    throw createError({ statusCode: 400, statusMessage: 'Filename/URL mismatch' });
  }
}

function validateFilename(filename: string) {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' });
  }
}

function validateRawGitHub(urlString: string) {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' });
  }

  if (url.hostname !== 'raw.githubusercontent.com') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only raw.githubusercontent.com is allowed',
    });
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10_000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function syncFileFromGitHub(
  target: SyncTarget,
  options?: { allowList?: AllowedFileMap; timeoutMs?: number },
): Promise<SyncResult> {
  validateAllowList(target, options?.allowList);
  validateFilename(target.filename);
  if (!options?.allowList) {
    validateRawGitHub(target.url);
  }

  const prior = await readStorageMeta(target.filename);
  const headers = buildHeaders(prior);

  const res = await fetchWithTimeout(
    target.url,
    { headers, redirect: 'follow' },
    options?.timeoutMs,
  );

  if (res.status === 304) {
    const cachedBuf = prior ? await readStorageFile(target.filename) : null;
    return {
      status: 'not-modified',
      etag: prior?.etag ?? null,
      lastModified: prior?.lastModified ?? null,
      size: prior?.size,
      data: cachedBuf ?? undefined,
      path: target.filename,
    };
  }

  if (!res.ok) {
    throw createError({
      statusCode: res.status || 502,
      statusMessage: `GitHub fetch failed (${res.status})`,
    });
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeStorageFile(target.filename, buffer);

  const etag = res.headers.get('etag');
  const lastModified = res.headers.get('last-modified');

  const entry: MetaEntry = {
    etag,
    lastModified,
    syncedAt: Date.now(),
    size: buffer.length,
  };

  await writeStorageMeta(target.filename, entry);

  return {
    status: 'downloaded',
    path: target.filename,
    etag,
    lastModified,
    size: buffer.length,
    data: buffer,
  };
}

export async function getCachedFile(filename: string) {
  return readStorageFile(filename);
}

export async function getMeta(filename: string) {
  return readStorageMeta(filename);
}
