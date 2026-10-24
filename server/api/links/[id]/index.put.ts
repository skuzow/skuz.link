import { LinkCreationSchema } from '#shared/schemas/link.schema';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const { repository, link: ownedLink } = await requireOwnedLink(
    event,
    user.id
  );

  const body = await readBody(event);
  const result = LinkCreationSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fields',
      data: result.error.issues
    });
  }

  try {
    const link = await repository.link.update(ownedLink.id, result.data);

    const requestURL = getRequestURL(event);
    const slugs = new Set([ownedLink.slug, link.slug]);
    await Promise.all(
      [...slugs].map((slug) => purgeLinkRedirect(requestURL.origin, slug))
    );

    return {
      statusCode: 200,
      statusMessage: 'Link edited successfully',
      body: {
        link
      }
    };
  } catch (error) {
    throw toLinkConflictError(error);
  }
});
