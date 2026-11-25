// daily at 03:05 UTC, a few minutes after the auth layer's Session purge;
// Nitro runs a task only when the Cron Trigger that fires carries exactly its
// schedule, so both come from this one value
const CLICK_PURGE_CRON = '5 3 * * *';

// https://nuxt.com/docs/guide/going-further/layers
export default defineNuxtConfig({
  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en-US.json'
      },
      {
        code: 'es',
        file: 'es-ES.json'
      }
    ]
  },

  nitro: {
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      [CLICK_PURGE_CRON]: ['links:purge-clicks']
    },
    // merged into the Worker's generated wrangler.json with wrangler.jsonc and
    // the auth layer's Session purge cron
    cloudflare: {
      wrangler: {
        triggers: {
          crons: [CLICK_PURGE_CRON]
        }
      }
    }
  }
});
