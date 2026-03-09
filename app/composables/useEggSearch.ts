import { useDebounceFn } from '@vueuse/core';
import type { CommandPaletteItem } from '@nuxt/ui';
import type { EggListItem } from '#shared/types/egg';
import type { IndexedEgg, UseEggSearchOptions } from '#shared/types/search';

const buildIndexed = (eggs: EggListItem[]): IndexedEgg[] =>
  eggs.map((egg) => ({
    ...egg,
    nameLower: egg.name.toLowerCase(),
    slugLower: egg.slug.toLowerCase(),
    categoryLower: egg.category.toLowerCase(),
    repoLower: egg.repo.toLowerCase(),
  }));

function scoreMatch(egg: IndexedEgg, terms: string[]) {
  let score = 0;
  const fields = [egg.nameLower, egg.slugLower, egg.categoryLower, egg.repoLower];
  for (const term of terms) {
    for (const f of fields) {
      if (f.includes(term)) {
        score += 1;
        if (f.startsWith(term)) score += 1;
        if (f === term) score += 2;
      }
    }
  }
  const full = terms.join(' ');
  if (fields[0]?.startsWith(full)) score += 3;
  return score;
}

export function useEggSearch(eggs: Ref<EggListItem[]>, options: UseEggSearchOptions = {}) {
  const maxResults = options.maxResults ?? 50;
  const suggestions = options.suggestions ?? [
    'paper',
    'purpur',
    'nodejs',
    'minecraft',
    'factorio',
    'terraria',
    'rust',
    'valheim',
  ];

  const indexedEggs = computed(() => buildIndexed(eggs.value));

  const searchTerm = ref('');
  const query = ref('');
  const selectedItem = ref<CommandPaletteItem | null>(null);

  const updateQuery = useDebounceFn((v: string) => {
    query.value = v.trim().toLowerCase();
  }, 150);

  watch(searchTerm, (v) => updateQuery(v));

  const groups = computed(() => [
    {
      id: 'eggs',
      items: indexedEggs.value.map((egg) => ({
        label: egg.name,
        suffix: `${egg.category} · ${egg.repo}`,
        value: egg.slug,
        to: `/egg/${egg.slug}`,
      })),
    },
  ]);

  const quickLinks = computed(() => {
    if (!indexedEggs.value.length) return suggestions;
    return suggestions.filter((s) =>
      indexedEggs.value.some((e) => e.nameLower.includes(s) || e.categoryLower.includes(s)),
    );
  });

  const filtered = computed<EggListItem[]>(() => {
    const q = query.value;
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return indexedEggs.value
      .map((egg) => ({ egg, score: scoreMatch(egg, terms) }))
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          `${a.egg.repo}/${a.egg.slug}`.localeCompare(`${b.egg.repo}/${b.egg.slug}`),
      )
      .slice(0, maxResults)
      .map((item) => item.egg);
  });

  const onSelect = (item: CommandPaletteItem | null) => {
    if (item && 'value' in item && item.value) {
      navigateTo(`/egg/${item.value}`);
    }
    selectedItem.value = null;
    searchTerm.value = '';
  };

  const lastUpdated = computed(() => (eggs.value.length ? new Date() : null));

  return {
    maxResults,
    searchTerm,
    query,
    selectedItem,
    groups,
    quickLinks,
    filtered,
    onSelect,
    lastUpdated,
  };
}
