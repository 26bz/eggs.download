<template>
  <UPage>
    <UContainer>
      <UPageHeader title="API Documentation" description="Use eggs.download in your custom resources" />
    </UContainer>

    <UPageBody>
      <UContainer>
        <div class="space-y-5">
          <UCard>
            <div class="space-y-2 text-sm text-muted">
              <p>JSON API for Pterodactyl and Pelican eggs.</p>
              <p>CORS enabled. Rate limit: <strong>420 req/hour/IP</strong>.</p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Endpoints</h2>
            </template>
            <div class="space-y-3 text-sm">
              <div class="rounded-lg border border-default p-3">
                <div class="flex items-center gap-2">
                  <UBadge color="success" variant="subtle" size="sm">GET</UBadge>
                  <code class="text-sm font-mono">/api/eggs</code>
                </div>
                <p class="mt-1 text-muted">Egg index (supports filters).</p>
              </div>

              <div class="rounded-lg border border-default p-3">
                <div class="flex items-center gap-2">
                  <UBadge color="success" variant="subtle" size="sm">GET</UBadge>
                  <code class="text-sm font-mono">/api/eggs/:slug</code>
                </div>
                <p class="mt-1 text-muted">Full egg JSON + metadata + optional README.</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Query Params</h2>
            </template>
            <div :class="proseClasses">
              <MDC :value="queryParamsCode" />
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Examples</h2>
            </template>
            <div class="space-y-3">
              <div :class="proseClasses">
                <MDC :value="filterQueryCode" />
              </div>
              <div :class="proseClasses">
                <MDC :value="namesQueryCode" />
              </div>
              <div :class="proseClasses">
                <MDC :value="curlSlugCode" />
              </div>
            </div>
          </UCard>

          <UCard>
            <template #footer>
              <div class="flex gap-2">
                <UButton
                  to="https://github.com/26bz/eggs.download"
                  target="_blank"
                  color="neutral"
                  variant="subtle"
                  icon="i-simple-icons-github"
                >
                  Source
                </UButton>
                <UButton to="/" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
                  Back home
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const proseClasses =
  'prose prose-sm dark:prose-invert max-w-none [&_pre]:!bg-gray-950/5 [&_pre]:dark:!bg-gray-50/5 [&_pre]:!rounded-lg [&_pre]:!p-3 [&_pre]:!text-xs [&_pre]:!m-0 [&_pre]:!whitespace-pre-wrap [&_pre]:!break-all [&_pre]:!font-mono [&_pre]:focus-visible:outline-2 [&_pre]:focus-visible:outline-primary';

onMounted(() => {
  nextTick(() => {
    document.querySelectorAll('pre.shiki, pre[class*="language-"]').forEach((el) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });
  });
});

const filterQueryCode = `\`\`\`bash
# All games from Pterodactyl game-eggs
curl "https://eggs.download/api/eggs?source=pterodactyl&repo=game-eggs"
\`\`\``;

const queryParamsCode = `\`\`\`md
source
Filter by source (\`pterodactyl\`, \`pelican\`, \`community\`).

repo
Filter by repository (example: \`game-eggs\`).

category
Filter by category path root.

owner
Filter by GitHub org/user.

fields=name
Return names-only array from filtered results.
\`\`\``;

const namesQueryCode = `\`\`\`bash
# Names only (great for icon tooling)
curl "https://eggs.download/api/eggs?source=pterodactyl&repo=game-eggs&fields=name"
\`\`\``;

const curlSlugCode = `\`\`\`bash
# Full details for one egg
curl "https://eggs.download/api/eggs/minecraft-paper"
\`\`\``;
</script>
