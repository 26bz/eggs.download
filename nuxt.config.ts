import { resolve } from 'node:path';

export default defineNuxtConfig({
  alias: {
    '#shared': resolve(__dirname, 'shared'),
    '#shared/*': resolve(__dirname, 'shared/*'),
    '#shared/types': resolve(__dirname, 'shared/types'),
  },
  modules: [
    'nitro-cloudflare-dev',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@nuxt/scripts',
    'nuxt-security',
    '@nuxt/a11y',
    '@nuxt/hints',
  ],

  security: {
    strict: false, // Disable strict CSP to allow 'unsafe-inline' styles (hashes cause unsafe-inline to be ignored)
    hidePoweredBy: true,
    removeLoggers: true,
    nonce: false,
    ssg: false,
    sri: false, // Disable Subresource Integrity hashes
    rateLimiter: {
      tokensPerInterval: 420,
      interval: 3600000,
      throwError: true,
      ipHeader: 'cf-connecting-ip',
    },
    headers: {
      contentSecurityPolicy: {
        'img-src': [
          "'self'",
          'data:',
          'https://raw.githubusercontent.com',
          'https://github.com',
          'https://user-images.githubusercontent.com',
          'https://avatars.githubusercontent.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http:', 'https:'],
        'connect-src': [
          "'self'",
          'https://api.github.com',
          'https://raw.githubusercontent.com',
          'ws://localhost:*',
          'http://localhost:*',
          'https://*.githubusercontent.com',
        ],
      },
      permissionsPolicy: {
        camera: ['self'],
        microphone: ['self'],
        geolocation: ['self'],
        'web-share': false,
      },
    },
  },

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
      langs: ['json', 'shell', 'bash', 'sh', 'javascript', 'js'],
    },
  },

  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/api-docs': { prerender: true },
    '/api/eggs': {
      swr: 60 * 30,
      security: {
        corsHandler: {
          origin: '*',
          methods: ['GET', 'HEAD'],
        },
      },
    },
    '/api/eggs/**': {
      swr: 60 * 60,
      security: {
        corsHandler: {
          origin: '*',
          methods: ['GET', 'HEAD'],
        },
      },
    },
  },
  experimental: {
    inlineRouteRules: true,
    payloadExtraction: false,
    normalizeComponentNames: true,
    viewTransition: true,
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

      deployConfig: true,
      nodeCompat: true,
    },
    storage: {
      cache: { driver: 'cloudflare-kv-binding', binding: 'CACHE' },
    },
  },
  vite: {
    optimizeDeps: {
      include: ['@vueuse/core'],
    },
  },
});
