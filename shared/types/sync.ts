export type AllowedFileMap = Record<string, string>;

export interface SyncTarget {
  filename: string;
  url: string;
}

export interface SyncResult {
  status: 'downloaded' | 'not-modified';
  path: string;
  etag?: string | null;
  lastModified?: string | null;
  size?: number;
  data?: Buffer;
}

export interface MetaEntry {
  etag?: string | null;
  lastModified?: string | null;
  syncedAt?: number;
  size?: number;
}

export type MetaFile = Record<string, MetaEntry>;
