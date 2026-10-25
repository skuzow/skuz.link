import { requireUser } from '#layers/auth/server/current-user';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const repository = await useRepository(event);
  const userLinks = await repository.link.findAllByUserId(user.id);

  return {
    statusCode: 200,
    statusMessage: 'Links found',
    body: {
      links: userLinks
    }
  };
});
