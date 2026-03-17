import { createError, useRuntimeConfig } from '#imports';
import type { GitTreeItem } from '#shared/types/github';

function getToken(): string | undefined {
  try {
    const config = useRuntimeConfig();
    const token = config.githubToken;
    return typeof token === 'string' ? token : undefined;
  } catch {
    // fallback during early server init
    return process.env.GITHUB_TOKEN;
  }
}

async function githubFetch<T>(url: string): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'eggsdownload/1.0',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await $fetch(url, {
    headers,
    retry: 2,
    retryDelay: 500,
    onResponseError({ response }) {
      if (response.status === 403 || response.status === 429) {
        const reset = response.headers.get('x-ratelimit-reset');
        const msg = reset
          ? `GitHub rate limit exceeded. Resets at ${new Date(Number(reset) * 1000).toISOString()}`
          : 'GitHub rate limit exceeded';
        console.error(`[egghub] ${msg}`);
        throw createError({ statusCode: 429, statusMessage: msg });
      }
    },
  });
  // oxlint-disable-next-line no-unsafe-type-assertion
  return res as T;
}

export async function fetchTreeWithBranch(
  owner: string,
  repo: string,
): Promise<{ branch: string; tree: GitTreeItem[] }> {
  const branches = await getPreferredBranches(owner, repo);

  for (const branch of branches) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await githubFetch<{ tree: GitTreeItem[]; truncated?: boolean }>(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      );
      if (res?.tree) {
        if (res.truncated) {
          console.warn(`[egghub] Tree for ${owner}/${repo}@${branch} was truncated by GitHub API`);
        }
        return { branch, tree: res.tree };
      }
    } catch (error: unknown) {
      // oxlint-disable-next-line no-unsafe-type-assertion
      const err = error as Record<string, unknown>;
      const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : undefined;
      if (statusCode === 429) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[egghub] tree fetch failed for ${owner}/${repo}@${branch}:`, message);
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: `Unable to fetch tree for ${owner}/${repo}`,
  });
}

async function getPreferredBranches(owner: string, repo: string): Promise<string[]> {
  try {
    const repoMeta = await githubFetch<{ default_branch?: string }>(
      `https://api.github.com/repos/${owner}/${repo}`,
    );
    if (repoMeta?.default_branch) {
      return Array.from(new Set([repoMeta.default_branch, 'main', 'master']));
    }
  } catch (error: unknown) {
    // oxlint-disable-next-line no-unsafe-type-assertion
    const err = error as Record<string, unknown>;
    const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : undefined;
    if (statusCode === 429) throw error;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[egghub] repo meta fetch failed for ${owner}/${repo}:`, message);
  }
  return ['main', 'master'];
}

export function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'untitled'
  );
}

export function toTitle(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
