import { fetchTreeWithBranch, slugify, toTitle } from './github';
import type { EggEntry } from '#shared/types/egg';

const SOURCES = [
  {
    owner: 'pterodactyl',
    source: 'pterodactyl',
    repos: ['game-eggs', 'application-eggs', 'generic-eggs'],
  },
  {
    owner: 'pelican-eggs',
    source: 'pelican',
    repos: [
      'minecraft',
      'games-steamcmd',
      'voice',
      'games-standalone',
      'software',
      'generic',
      'monitoring',
      'chatbots',
      'database',
      'storage',
    ],
  },
  {
    owner: 'EuphoriaDevelopmentOrg',
    source: 'community',
    repos: ['NitroCraft'],
  },
] as const;

const CACHE_KEY = 'egg-index:v2';
const TTL_SECONDS = 60 * 30; // 30 minutes

async function buildIndex(): Promise<EggEntry[]> {
  const repoJobs = SOURCES.flatMap(({ owner, source, repos }) =>
    repos.map((repo) => ({ owner, source, repo })),
  );

  const entries: EggEntry[] = [];
  const BATCH_SIZE = 2;

  const processRepo = async ({ owner, source, repo }: (typeof repoJobs)[number]) => {
    const { branch, tree } = await fetchTreeWithBranch(owner, repo);

    const pathPrefix =
      owner === 'EuphoriaDevelopmentOrg' && repo === 'NitroCraft' ? 'pterodactyl egg/' : null;

    const eggFiles = tree.filter((item) => {
      if (item.type !== 'blob' || !/egg-.*\.json$/i.test(item.path)) return false;
      if (pathPrefix && !item.path.startsWith(pathPrefix)) return false;
      return true;
    });

    const repoEntries: EggEntry[] = [];
    const usedSlugs = new Set<string>();

    for (const file of eggFiles) {
      const parts = file.path.split('/');
      const filename = parts.pop() || '';
      const category = parts[0] || 'misc';
      const base = filename.replace(/^egg-/i, '').replace(/\.json$/i, '');
      const folder = parts.join('/');
      const baseSlug = slugify(base);

      let slug = usedSlugs.has(baseSlug) ? `${source}-${baseSlug}` : baseSlug;

      const pathDupe = repoEntries.some(
        (e) => e.slug === slug && e.path.split('/').slice(0, -1).join('/') === folder,
      );
      if (pathDupe) {
        slug = `${slug}-${slugify(filename.replace(/\.json$/i, ''))}`;
      }

      usedSlugs.add(slug);

      repoEntries.push({
        slug,
        name: toTitle(base),
        category,
        source,
        owner,
        repo,
        branch,
        path: file.path,
        rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`,
      });
    }

    entries.push(...repoEntries);
  };

  for (let i = 0; i < repoJobs.length; i += BATCH_SIZE) {
    const batch = repoJobs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map((job) => processRepo(job)));
    for (const result of batchResults) {
      if (result.status === 'rejected') {
        console.error(
          '[egghub] Failed to index repo:',
          (result.reason as Error)?.message ?? result.reason,
        );
      }
    }
  }
  return entries;
}

export async function getEggIndex(): Promise<EggEntry[]> {
  const storage = useStorage('cache');
  const cacheKey = CACHE_KEY;

  const cached = await storage.getItem<{ at: number; data: EggEntry[] }>(cacheKey);
  if (cached && Date.now() - cached.at < TTL_SECONDS * 1000) {
    return cached.data;
  }

  const data = await buildIndex();
  await storage.setItem(cacheKey, { at: Date.now(), data });
  return data;
}
