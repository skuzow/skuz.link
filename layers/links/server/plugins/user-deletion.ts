import { useLinkService } from '#layers/links/server/container';

// the database cascade deletes the User's Links, but their cached Redirects
// would keep serving until they expire, so purge them first (ADR-0003)
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('auth:user:deleting', async (event, userId) => {
    const linkService = await useLinkService(event);

    await linkService.purgeOwnerRedirects(userId);
  });
});
