export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const { repository, link } = await requireOwnedLink(event, user.id);

  await repository.link.delete(link.id);

  const requestURL = getRequestURL(event);
  await purgeLinkRedirect(requestURL.origin, link.slug);

  return {
    statusCode: 200,
    statusMessage: 'Link deleted successfully'
  };
});
