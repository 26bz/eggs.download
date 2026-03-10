import { resolve } from 'node:path';

export default defineNuxtConfig({
  alias: {
    '#shared': resolve(__dirname, 'shared'),
    '#shared/*': resolve(__dirname, 'shared/*'),
    '#shared/types': resolve(__dirname, 'shared/types'),
  },
  modules: ['@nuxt/ui', '@nuxtjs/mdc', '@nuxt/scripts'],

  devtools: {
    enabled: true,
  },

  compatibilityDate: '2026-03-07',

  css: ['~/assets/css/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  mdc: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
      langs: ['json', 'shell', 'bash', 'sh'],
    },
  },

  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
  },

  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/api/eggs': { swr: 60 * 30 }, // 30 min stale-while-revalidate
    '/api/eggs/**': { swr: 60 * 60 }, // 1 hour stale-while-revalidate
    '/**': {
      headers: {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
      },
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      wrangler: {
        kv_namespaces: [
          {
            binding: 'CACHE',
            id: 'a58cac9d73c6427da0673fd764dfc4e7',
          },
        ],
      },
    },
    storage: {
      cache: { driver: 'cloudflare-kv-binding', binding: 'CACHE' },
    },
  },
});
