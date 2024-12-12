// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/reset.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    // '@vueuse/sound/nuxt',
  ],
})
