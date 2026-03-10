import type { EggDetail } from '#shared/types/egg';

const memoryCache = new Map<string, { ts: number; payload: EggDetail }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export default defineEventHandler(async (event): Promise<EggDetail> => {
  const slug = getRouterParam(event, 'slug') || '';

  const now = Date.now();
  const cached = memoryCache.get(slug);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.payload;
  }

  const index = await getEggIndex();
  const eggMeta = index.find((item) => item.slug === slug);

  if (!eggMeta) {
    throw createError({ statusCode: 404, statusMessage: `Egg not found: ${slug}` });
  }

  const eggCacheFile = `${slug || 'egg'}.json`;
  let egg: EggDetail['egg'];
  try {
    const { data } = await syncFileFromGitHub({
      filename: eggCacheFile,
      url: eggMeta.rawUrl,
    });
    const text = data ? data.toString('utf8') : null;
    if (!text) throw createError({ statusCode: 502, statusMessage: 'Failed to load egg JSON' });
    egg = JSON.parse(text) as EggDetail['egg'];
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch egg JSON from GitHub' });
  }

  if (!egg || typeof egg !== 'object') {
    throw createError({ statusCode: 502, statusMessage: 'Invalid egg JSON format from GitHub' });
  }

  const dir = eggMeta.path.split('/').slice(0, -1).join('/');
  const readmeCandidates = ['README.md', 'readme.md', 'Readme.md'].map(
    (name) =>
      `https://raw.githubusercontent.com/${eggMeta.owner}/${eggMeta.repo}/${eggMeta.branch}/${dir ? `${dir}/` : ''}${name}`,
  );

  let readme: string | null = null;
  for (const url of readmeCandidates) {
    try {
      const filename = `${slug || 'egg'}-readme.md`;
      const { data } = await syncFileFromGitHub({ filename, url });
      const text = data ? data.toString('utf8') : null;
      if (text) {
        readme = text;
        break;
      }
    } catch {}
  }

  const payload = { egg, meta: eggMeta, readme };
  memoryCache.set(slug, { ts: now, payload });
  return payload;
});
