// daily at 03:00 UTC; Nitro runs a task only when the Cron Trigger that fires
// carries exactly its schedule, so both come from this one value
const SESSION_PURGE_CRON = '0 3 * * *';

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
      [SESSION_PURGE_CRON]: ['auth:purge-sessions']
    },
    // merged into the Worker's generated wrangler.json with wrangler.jsonc
    cloudflare: {
      wrangler: {
        triggers: {
          crons: [SESSION_PURGE_CRON]
        }
      }
    }
  }
});
