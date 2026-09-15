// import tailwind from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-authentication'
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    prefix: 'Nuxt'
  },

  nuxtAuthentication: {
    // Same backend as prodDomain below - hardcoding localhost here meant a
    // deployed build tried to authenticate against the visitor's own
    // machine, so login could never work anywhere but a dev laptop.
    domain: process.env.NUXT_PUBLIC_DJANGO_SHOP_PROD_DOMAIN || 'http://127.0.0.1:8000',
    accessEndpoint: '/auth/v1/token/',
    refreshEndpoint: '/auth/v1/token/refresh/',
    verifyEndpoint: '/auth/v1/token/verify/' 
  },

  test: {

  },

  runtimeConfig: {
    public: {
      prodDomain: process.env.NUXT_PUBLIC_DJANGO_SHOP_PROD_DOMAIN || 'http://127.0.0.1:8000',
      prodCartDomain: process.env.NUXT_PUBLIC_DJANGO_CART_PROD_DOMAIN || 'http://127.0.0.1:8001',
      prodReviewsDomain: process.env.NUXT_PUBLIC_DJANGO_REVIEWS_PROD_DOMAIN || 'http://127.0.0.1:8002'
    }
  }
})
