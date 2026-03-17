<template>
  <UPage>
    <UContainer>
      <UPageHeader
        title="API Documentation"
        description="Use eggs.download in your custom resources"
      />
    </UContainer>

    <UPageBody>
      <UContainer>
        <div class="space-y-6">
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Overview</h2>
            </template>
            <div class="space-y-4 text-sm text-muted">
              <p>
                The eggs.download API lets you fetch Pterodactyl and Pelican egg configurations
                directly in your applications, scripts, or custom panel resources.
              </p>
              <p>All endpoints return JSON and support CORS, so you can call them from anywhere.</p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Endpoints</h2>
            </template>
            <div class="space-y-6 text-sm">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <UBadge color="success" variant="subtle">GET</UBadge>
                  <code class="text-sm font-mono">/api/eggs</code>
                </div>
                <p class="text-muted mb-2">
                  Returns the full index of all available eggs with metadata.
                </p>
                <div :class="proseClasses">
                  <MDC :value="curlIndexCode" />
                </div>
              </div>

              <USeparator />

              <div>
                <div class="flex items-center gap-2 mb-2">
                  <UBadge color="success" variant="subtle">GET</UBadge>
                  <code class="text-sm font-mono">/api/eggs/:slug</code>
                </div>
                <p class="text-muted mb-2">
                  Returns full egg details including the raw JSON config, metadata, and README if
                  available.
                </p>
                <div :class="proseClasses">
                  <MDC :value="curlSlugCode" />
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Rate Limits</h2>
            </template>
            <div class="space-y-3 text-sm text-muted">
              <p>To keep things fair for everyone, there's a simple rate limit in place:</p>
              <ul class="list-disc pl-5 space-y-1">
                <li><strong>420 requests</strong> per hour per IP</li>
                <li>Responses are cached, so repeated requests are fast</li>
                <li>If you hit the limit, wait a bit and try again</li>
              </ul>
              <p class="text-dimmed">
                This is pretty generous for most use cases. If you need more, reach out.
              </p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Example: Fetch an Egg in JavaScript</h2>
            </template>
            <div :class="proseClasses">
              <MDC :value="jsFetchCode" />
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">Response Structure</h2>
            </template>
            <div class="space-y-4 text-sm">
              <div>
                <p class="font-medium text-highlighted mb-2">Index Response</p>
                <div :class="proseClasses">
                  <MDC :value="indexResponseCode" />
                </div>
              </div>

              <div>
                <p class="font-medium text-highlighted mb-2">Detail Response</p>
                <div :class="proseClasses">
                  <MDC :value="detailResponseCode" />
                </div>
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

const curlIndexCode = `\`\`\`bash
curl https://eggs.download/api/eggs
\`\`\``;

const curlSlugCode = `\`\`\`bash
curl https://eggs.download/api/eggs/minecraft-paper
\`\`\``;

const jsFetchCode = `\`\`\`javascript
const response = await fetch('https://eggs.download/api/eggs/minecraft-paper');
const data = await response.json();

console.log(data.egg.name);        // "Paper"
console.log(data.egg.startup);     // startup command
console.log(data.meta.source);     // "pterodactyl" or "pelican"
console.log(data.readme);          // README content (if available)
\`\`\``;

const indexResponseCode = `\`\`\`json
[
  {
    "slug": "minecraft-paper",
    "name": "Paper",
    "source": "pterodactyl",
    "category": "game-eggs",
    "path": "minecraft/paper/egg-paper.json",
    "rawUrl": "https://raw.githubusercontent.com/..."
  }
]
\`\`\``;

const detailResponseCode = `\`\`\`json
{
  "egg": {
    "name": "Paper",
    "author": "parker@pterodactyl.io",
    "description": "High performance Minecraft server",
    "startup": "java -Xms128M ...",
    "docker_images": { ... },
    "variables": [ ... ],
    "scripts": { ... }
  },
  "meta": {
    "slug": "minecraft-paper",
    "name": "Paper",
    "source": "pterodactyl",
    "category": "game-eggs",
    "repo": "parkervcp/eggs",
    "owner": "parkervcp",
    "branch": "master",
    "path": "game_eggs/minecraft/java/paper/egg-paper.json",
    "rawUrl": "https://raw.githubusercontent.com/..."
  },
  "readme": "# Paper\\n\\nHigh performance Minecraft server..."
}
\`\`\``;
</script>
