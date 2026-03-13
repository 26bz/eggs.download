<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const footerLinks: NavigationMenuItem[] = [
  {
    label: 'Source',
    to: 'https://github.com/26bz/eggs.download',
    target: '_blank',
  },
  {
    label: 'Donate',
    to: 'https://ko-fi.com/26bz',
    target: '_blank',
  },
  {
    label: 'About',
    to: '/about',
  },
];
useHead({
  titleTemplate: (titleChunk) =>
    titleChunk ? `${titleChunk} | eggs.download` : 'eggs.download - Pterodactyl & Pelican eggs',
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en',
  },
});

useSeoMeta({
  title: 'eggs.download - Pterodactyl & Pelican eggs',
  description:
    'Search and browse Pterodactyl and Pelican eggs with startup commands, env vars, install scripts, and raw JSON in one place.',
  ogTitle: 'eggs.download - Pterodactyl & Pelican eggs',
  ogDescription:
    'Search and browse Pterodactyl and Pelican eggs with startup commands, env vars, install scripts, and raw JSON in one place.',
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <UApp>
    <NuxtAnnouncer />
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="noto:egg" type="dashed" class="h-px" :decorative="true" />

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          <NuxtLink href="https://26bz.com" target="_blank">Made by 26bz</NuxtLink>
        </p>
      </template>

      <UNavigationMenu :items="footerLinks" variant="link" />

      <template #right>
        <div class="flex items-center justify-end gap-2">
          <UColorModeButton size="xs" color="neutral" variant="ghost" aria-label="Toggle color mode" />
        </div>
      </template>
    </UFooter>
  </UApp>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
