const parseList = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export default defineNitroPlugin(() => {
  const intervalMs = Number(process.env.SYNC_INTERVAL_MS || '') || 0;
  const maxConcurrent = Math.max(1, Number(process.env.SYNC_CONCURRENCY || '') || 5);

  const hotSlugs = parseList(process.env.HOT_EGGS);
  const prewarmAll = String(process.env.HOT_EGGS_ALL || '').toLowerCase() === 'true';
  const hotIntervalMs = Number(process.env.HOT_EGGS_INTERVAL_MS || '') || 0;

  const allowlistTargets = Object.entries(FILE_ALLOWLIST).map(([filename, url]) => ({
    filename,
    url,
  }));

  const syncAllowlist = async () => {
    if (!allowlistTargets.length) return;

    for (let i = 0; i < allowlistTargets.length; i += maxConcurrent) {
      const batch = allowlistTargets.slice(i, i + maxConcurrent);
      // oxlint:disable-next-line no-await-in-loop
      await Promise.allSettled(
        batch.map(async (target) => {
          try {
            await syncFileFromGitHub(target, { allowList: FILE_ALLOWLIST });
          } catch (error) {
            console.error('[cache] sync failed', target.filename, error);
          }
        }),
      );
    }
  };

  const syncHotEggs = async () => {
    if (!prewarmAll && !hotSlugs.length) return;

    const index = await getEggIndex();
    const metaBySlug = new Map(index.map((item) => [item.slug, item]));

    const eggTargets = (
      prewarmAll ? Array.from(metaBySlug.values()) : hotSlugs.map((slug) => metaBySlug.get(slug))
    ).filter(Boolean);

    for (let i = 0; i < eggTargets.length; i += maxConcurrent) {
      const batch = eggTargets.slice(i, i + maxConcurrent);
      await Promise.allSettled(
        batch.map(async (eggMeta) => {
          if (!eggMeta) return;
          const slug = eggMeta.slug || 'egg';
          await syncFileFromGitHub({ filename: `${slug}.json`, url: eggMeta.rawUrl });

          const dir = eggMeta.path.split('/').slice(0, -1).join('/');
          const candidates = ['README.md', 'readme.md', 'Readme.md'].map(
            (name) =>
              `https://raw.githubusercontent.com/${eggMeta.owner}/${eggMeta.repo}/${eggMeta.branch}/${
                dir ? `${dir}/` : ''
              }${name}`,
          );
          for (const url of candidates) {
            try {
              await syncFileFromGitHub({ filename: `${slug}-readme.md`, url });
              break;
            } catch {}
          }
        }),
      );
    }
  };

  if (allowlistTargets.length) {
    void syncAllowlist();
  }

  if (prewarmAll || hotSlugs.length) {
    void syncHotEggs();
  }

  if (intervalMs > 0 && allowlistTargets.length) {
    setInterval(() => {
      void syncAllowlist();
    }, intervalMs);
  }

  if (hotIntervalMs > 0 && (prewarmAll || hotSlugs.length)) {
    setInterval(() => {
      void syncHotEggs();
    }, hotIntervalMs);
  }
});
