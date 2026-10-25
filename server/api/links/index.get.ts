export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);

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
