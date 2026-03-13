<template>
  <UContainer class="min-h-screen flex items-center justify-center py-12">
    <div class="w-full max-w-xl space-y-4 text-center hero" :class="{ 'hero--enter': heroReady }">
      <div class="space-y-2">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-[0.18em]">
          eggs.download
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your server egg</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400 type-line">
          {{ typedLine }}
          <span class="type-caret" aria-hidden="true"></span>
        </p>
      </div>

      <UCommandPalette
        v-model="selectedItem"
        v-model:search-term="searchTerm"
        :groups="groups"
        :fuse="{ resultLimit: maxResults, matchAllWhenSearchEmpty: false }"
        :placeholder="placeholder"
        icon="noto:egg"
        :selected-icon="null"
        class="w-full"
        @update:model-value="onSelect"
      >
        <template #empty>
          <div
            v-if="status === 'success' && !query"
            class="flex flex-wrap justify-center gap-2 text-sm"
          >
            <UButton
              v-for="tag in quickLinks"
              :key="tag"
              size="sm"
              color="neutral"
              variant="subtle"
              @click="searchTerm = tag"
            >
              {{ tag }}
            </UButton>
          </div>
          <div
            class="text-sm text-gray-500 dark:text-gray-400 pt-2 pb-2 flex items-center justify-center gap-2"
          >
            <UIcon name="tabler:egg-cracked-filled" class="text-yellow-600" />
            {{ searchTerm ? 'No results. Try another term.' : 'Start typing to search eggs.' }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            <template v-if="status === 'pending'">
              <USkeleton class="h-4 w-40" />
            </template>
            <template v-else-if="status === 'error'">
              <span class="text-red-500">
                Failed to load egg index.
                <button class="underline ml-1" @click="refresh()">Retry</button>
              </span>
            </template>
            <template v-else-if="!query">
              {{ eggs.length.toLocaleString() }} eggs indexed
              <span v-if="lastUpdated" class="text-xs text-gray-500 dark:text-gray-400">
                · updated
                <NuxtTime
                  :datetime="lastUpdated"
                  hour="numeric"
                  minute="2-digit"
                  second="2-digit"
                />
              </span>
            </template>
            <template v-else>
              {{ filtered.length }} result{{ filtered.length === 1 ? '' : 's' }}
            </template>
          </div>
        </template>
      </UCommandPalette>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { EggListItem } from '#shared/types/egg';

useSeoMeta({
  title: 'eggs.download - Search Pterodactyl & Pelican Eggs',
  description:
    'Instantly search hundreds of game server eggs from Pterodactyl and Pelican repositories. Find startup scripts, variables, and Docker images.',
});

const heroReady = ref(false);

const suggestionSeeds = [
  'paper',
  'purpur',
  'nodejs',
  'minecraft',
  'factorio',
  'terraria',
  'rust',
  'valheim',
];

const phrases = [
  'Search Pterodactyl and Pelican eggs in one place.',
  'Grab startup commands, env vars, and Dockerfiles fast.',
  'Type to jump into any repo or category.',
];
const typedLine = ref<string>(phrases[0] ?? '');
const placeholder = ref<string>('Search eggs by name, category, or repo…');

const cycleTyping = () => {
  let index = 0;
  const play = async () => {
    index = (index + 1) % phrases.length;
    const target = phrases[index] ?? '';
    await typeTo(target, typedLine);
    await typeTo(`Try "${suggestionSeeds[index % suggestionSeeds.length]}"`, placeholder);
  };
  const loop = async () => {
    while (true) {
      await new Promise((r) => setTimeout(r, 2600));
      await play();
    }
  };
  loop();
};

async function typeTo(target: string, targetRef: Ref<string>) {
  const current = targetRef.value;
  let i = 0;
  while (i < target.length && targetRef.value !== target) {
    targetRef.value = target.slice(0, i + 1);
    i += 1;
    await new Promise((r) => setTimeout(r, 14));
  }
  targetRef.value = target;
}

onMounted(() => {
  heroReady.value = true;
  cycleTyping();
});

const { data, status, refresh } = await useApiFetch<EggListItem[]>('/api/eggs', {
  key: 'egg-index',
  transform: (eggs: EggListItem[]) =>
    eggs.map((e: EggListItem) => ({
      slug: e.slug,
      name: e.name,
      category: e.category,
      repo: e.repo,
      source: e.source,
    })),
  default: () => [] as EggListItem[],
});

const eggs = computed<EggListItem[]>(() => data.value ?? []);
const {
  maxResults,
  searchTerm,
  query,
  selectedItem,
  groups,
  quickLinks,
  filtered,
  onSelect,
  lastUpdated,
} = useEggSearch(eggs, {
  maxResults: 50,
  suggestions: suggestionSeeds,
});
</script>

<style scoped>
.hero {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.hero--enter {
  opacity: 1;
  transform: translateY(0);
}
.type-line {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.5em;
}
.type-caret {
  width: 1px;
  height: 1.2em;
  margin-left: 4px;
  background: currentColor;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  50.01%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero {
    transition: none;
    opacity: 1;
    transform: none;
  }
  .type-caret {
    animation: none;
  }
}
</style>
