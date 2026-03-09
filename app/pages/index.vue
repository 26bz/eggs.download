<template>
  <UContainer class="min-h-screen flex items-center justify-center py-12">
    <div class="w-full max-w-xl space-y-2 text-center">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-[0.18em]">
          eggs.download
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your server egg</h1>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          Search Pterodactyl and Pelican eggs from a single place.
        </p>
      </div>

      <UCommandPalette
        v-model="selectedItem"
        v-model:search-term="searchTerm"
        :groups="groups"
        :fuse="{ resultLimit: maxResults, matchAllWhenSearchEmpty: false }"
        placeholder="Search eggs by name, category, or repo…"
        icon="i-lucide-search"
        :selected-icon="null"
        class="w-full"
        @update:model-value="onSelect"
      >
        <template #empty>
          <div class="text-sm text-gray-500">
            {{ searchTerm ? 'No results. Try another term.' : 'Start typing to search eggs.' }}
          </div>
        </template>
      </UCommandPalette>

      <div class="text-sm text-gray-500 h-5">
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
          <span v-if="lastUpdated" class="text-xs text-gray-400 ml-1">
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

const { data, status, refresh } = await useAsyncData(
  'egg-index',
  (_nuxtApp, { signal }) => $fetch<EggListItem[]>('/api/eggs', { signal }),
  {
    transform: (eggs) =>
      eggs.map((e) => ({
        slug: e.slug,
        name: e.name,
        category: e.category,
        repo: e.repo,
        source: e.source,
      })),
    default: () => [] as EggListItem[],
  },
);

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
  suggestions: [
    'paper',
    'purpur',
    'nodejs',
    'minecraft',
    'factorio',
    'terraria',
    'rust',
    'valheim',
  ],
});
</script>
