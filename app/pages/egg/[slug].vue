<template>
  <UPage>
    <UPageBody>
      <UContainer class="py-6 max-w-5xl">
        <div class="flex items-center justify-between mb-6">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <UIcon name="i-lucide-arrow-left" class="text-base" />
            Back
          </NuxtLink>
        </div>

        <div v-if="status === 'pending'" class="space-y-6">
          <div class="space-y-2">
            <USkeleton class="h-8 w-48" />
            <USkeleton class="h-4 w-72" />
          </div>
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-64 w-full rounded-xl" />
        </div>

        <div v-else-if="status === 'error'" class="text-center py-16 space-y-4">
          <UIcon name="i-lucide-circle-x" class="mx-auto text-4xl text-gray-400" />
          <h1 class="text-xl font-semibold">Egg not found</h1>
          <p class="text-gray-500">
            No egg matches the slug
            <code class="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded">{{
              slug
            }}</code
            >.<br />
            It may have been renamed or removed.
          </p>
          <NuxtLink to="/" class="inline-flex items-center gap-1 text-primary hover:underline">
            <UIcon name="i-lucide-search" />
            Search eggs
          </NuxtLink>
        </div>

        <div v-else-if="status === 'success' && egg" class="space-y-4">
          <div class="space-y-4">
            <div id="overview">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 class="text-3xl font-semibold">
                    {{ displayName }}
                  </h1>
                  <div
                    class="mt-1 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1"
                  >
                    <span v-if="meta?.category">{{ meta.category }}</span>
                    <span v-if="meta" class="text-gray-300 dark:text-gray-700">·</span>
                    <NuxtLink
                      v-if="githubHref"
                      :to="githubHref"
                      target="_blank"
                      class="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <UIcon name="i-simple-icons-github" class="text-xs" />
                      {{ meta?.source }} / {{ meta?.repo }}
                    </NuxtLink>
                  </div>
                </div>
                <div v-if="meta" class="flex items-center gap-2">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="subtle"
                    icon="i-lucide-download"
                    :to="`/api/eggs/${slug}`"
                    external
                    target="_blank"
                    download
                    @click="blastConfetti"
                  >
                    Download JSON
                  </UButton>
                  <UDropdownMenu :items="actionItems" :ui="{ content: 'w-64' }">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="subtle"
                      icon="i-lucide-code-2"
                      trailing-icon="i-lucide-chevron-down"
                    >
                      API actions
                    </UButton>
                  </UDropdownMenu>
                </div>
              </div>

              <p
                v-if="egg.description"
                class="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                {{ egg.description }}
              </p>

              <div class="mt-3 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span v-if="egg.exported_at">
                  <span class="font-medium">Exported:</span>
                  <NuxtTime
                    :datetime="egg.exported_at"
                    year="numeric"
                    month="short"
                    day="numeric"
                  />
                </span>
                <span v-if="egg.author">
                  <span class="font-medium">Author:</span> {{ egg.author }}
                </span>
                <span v-if="egg.meta?.version">
                  <span class="font-medium">Version:</span> {{ egg.meta.version }}
                </span>
              </div>
            </div>

            <UCard v-if="readme" id="readme">
              <template #header>
                <div class="flex items-center justify-between w-full">
                  <span class="font-medium">README</span>
                </div>
              </template>
              <ClientOnly>
                <MDC :value="readme" :class="proseClasses" />
                <template #fallback>
                  <pre class="text-xs font-mono overflow-auto whitespace-pre-wrap opacity-70">{{
                    readme
                  }}</pre>
                </template>
              </ClientOnly>
            </UCard>

            <UCard v-if="egg.startup" id="startup-card">
              <template #header>
                <span class="font-medium">Startup Command</span>
              </template>
              <div :class="proseClasses">
                <MDC :value="`\u0060\u0060\u0060shell\n${egg.startup}\n\u0060\u0060\u0060`" />
              </div>
            </UCard>

            <UAccordion v-model="activeAccordion" :items="accordionItems">
              <template #body="{ item }">
                <div
                  v-if="item.value === 'install' && activeAccordion === 'install'"
                  class="space-y-2"
                >
                  <div class="text-xs text-gray-500 flex flex-wrap gap-4 mb-1">
                    <span
                      >Container:
                      <code class="font-mono">{{
                        egg.scripts!.installation!.container
                      }}</code></span
                    >
                    <span
                      >Entrypoint:
                      <code class="font-mono">{{
                        egg.scripts!.installation!.entrypoint
                      }}</code></span
                    >
                  </div>
                  <div :class="proseClasses">
                    <ClientOnly>
                      <MDC
                        :value="`\u0060\u0060\u0060bash\n${egg.scripts!.installation!.script}\n\u0060\u0060\u0060`"
                      />
                      <template #fallback>
                        <pre>{{ egg.scripts!.installation!.script }}</pre>
                      </template>
                    </ClientOnly>
                  </div>
                </div>

                <div
                  v-else-if="item.value === 'vars' && activeAccordion === 'vars'"
                  class="space-y-2"
                >
                  <UTable
                    v-if="egg.variables?.length"
                    :data="egg.variables"
                    :columns="variableColumns"
                    sticky
                    class="flex-1"
                    :ui="{ tbody: 'divide-y divide-default' }"
                  />
                  <p v-else class="text-sm text-gray-500">No variables defined for this egg.</p>
                </div>

                <div v-else-if="item.value === 'raw' && activeAccordion === 'raw'">
                  <UCard>
                    <div
                      v-if="formatted"
                      :class="[
                        proseClasses,
                        '[&_pre]:max-h-150! [&_pre]:whitespace-pre! [&_pre]:break-normal!',
                      ]"
                    >
                      <MDC :value="`\u0060\u0060\u0060json\n${formatted}\n\u0060\u0060\u0060`" />
                    </div>
                  </UCard>
                </div>
              </template>
            </UAccordion>
          </div>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import type { AccordionItem, DropdownMenuItem, TableColumn } from '@nuxt/ui';
import type { EggData, EggMeta, EggResponse, EggVariable } from '#shared/types/egg';

interface JSConfettiApi {
  JSConfetti: {
    new (): {
      addConfetti: (options?: { emojis?: string[] }) => void;
    };
  };
}

declare global {
  interface Window extends JSConfettiApi {}
}

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const proseClasses =
  'prose prose-sm dark:prose-invert max-w-none [&_pre]:!bg-gray-950/5 [&_pre]:dark:!bg-gray-50/5 [&_pre]:!rounded-lg [&_pre]:!p-3 [&_pre]:!text-xs [&_pre]:!m-0 [&_pre]:!whitespace-pre-wrap [&_pre]:!break-all [&_pre]:!font-mono';

definePageMeta({
  validate: (r) => typeof r.params.slug === 'string' && !!r.params.slug,
});

const variableColumns: TableColumn<EggVariable>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'env_variable',
    header: 'Env Variable',
  },
];

const { data, status } = await useApiFetch<EggResponse>(computed(() => `/api/eggs/${slug.value}`), {
  key: `egg:${slug.value}`,
});

const egg = computed<EggData | null>(() => data.value?.egg ?? null);
const meta = computed<EggMeta | null>(() => data.value?.meta ?? null);
const readme = computed<string | null>(() => data.value?.readme ?? null);

const formatted = computed(() => (egg.value ? JSON.stringify(egg.value, null, 2) : ''));
const activeAccordion = ref<string | undefined>(undefined);

const displayName = computed(
  () => egg.value?.name || meta.value?.name || (typeof slug.value === 'string' ? slug.value : ''),
);

const githubHref = computed(() =>
  meta.value
    ? `https://github.com/${meta.value.owner}/${meta.value.repo}/blob/${meta.value.branch}/${meta.value.path}`
    : null,
);

const requestURL = useRequestURL();
const apiUrl = computed(() => `${requestURL.origin}/api/eggs/${slug.value}`);

const seoTitle = computed(() => {
  const name = egg.value?.name || meta.value?.name || slug;
  return name ? `${name} - eggs.download` : 'Egg - eggs.download';
});

const seoDescription = computed(() => {
  if (egg.value?.description) return egg.value.description;
  if (meta.value?.repo) return `Egg from ${meta.value.repo} (${meta.value.owner})`;
  return 'Browse Pterodactyl and Pelican eggs on eggs.download';
});

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterCard: 'summary',
});

const accordionItems = computed<AccordionItem[]>(() => {
  const items: AccordionItem[] = [];
  if (egg.value?.scripts?.installation?.script) {
    items.push({ label: 'Installation Script', value: 'install', icon: 'i-lucide-terminal' });
  }
  items.push({ label: 'Environment Variables', value: 'vars', icon: 'i-lucide-settings' });
  items.push({ label: 'Raw JSON', value: 'raw', icon: 'i-lucide-file-json' });
  return items;
});

const toast = useToast();
const { copy } = useClipboard();

const actionItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Copy curl request',
      icon: 'i-lucide-terminal',
      onSelect: () => copySnippet(buildCurl(apiUrl.value), 'curl request'),
    },
    {
      label: 'Copy JavaScript fetch',
      icon: 'i-lucide-code-2',
      onSelect: () => copySnippet(buildJsFetch(apiUrl.value), 'JavaScript fetch'),
    },
    {
      label: 'Copy PHP cURL',
      icon: 'i-lucide-code-2',
      onSelect: () => copySnippet(buildPhpCurl(apiUrl.value), 'PHP cURL'),
    },
    {
      label: 'Copy API URL',
      icon: 'i-lucide-link',
      onSelect: () => copySnippet(apiUrl.value, 'API URL'),
    },
  ],
]);

const { onLoaded } = useScriptNpm<JSConfettiApi>({
  packageName: 'js-confetti',
  file: 'dist/js-confetti.browser.js',
  version: '0.12.0',
  scriptOptions: {
    use() {
      if (typeof window === 'undefined' || typeof window.JSConfetti === 'undefined') return;
      return { JSConfetti: window.JSConfetti };
    },
  },
});

let confettiInstance: JSConfettiApi['JSConfetti']['prototype'] | null = null;

async function getConfetti() {
  if (confettiInstance) return confettiInstance;
  return new Promise<JSConfettiApi['JSConfetti']['prototype']>((resolve) => {
    onLoaded(({ JSConfetti }) => {
      confettiInstance = new JSConfetti();
      resolve(confettiInstance);
    });
  });
}

async function blastConfetti() {
  const confetti = await getConfetti();
  confetti?.addConfetti({ emojis: ['🥚'], emojiSize: 26 });
}

const { polite } = useAnnouncer();
async function copySnippet(text: string | null | undefined, label: string) {
  if (!text) return;
  await copy(text);
  polite(`Copied ${label}`);
  toast.add({ title: `Copied ${label}`, icon: 'i-lucide-check' });
}

function buildCurl(url: string | null | undefined) {
  if (!url) return '';
  return `curl -L "${url}"`;
}

function buildJsFetch(url: string | null | undefined) {
  if (!url) return '';
  return `fetch('${url}')\n  .then((res) => res.json())\n  .then(console.log)\n  .catch(console.error);`;
}

function buildPhpCurl(url: string | null | undefined) {
  if (!url) return '';
  return `<?php\n$ch = curl_init('${url}');\ncurl_setopt_array($ch, [\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_FOLLOWLOCATION => true,\n]);\n$response = curl_exec($ch);\ncurl_close($ch);\necho $response;\n`;
}
</script>
