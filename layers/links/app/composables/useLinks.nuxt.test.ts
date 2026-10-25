import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { createError } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { toast } from 'vue-sonner';
import { makeLink } from '#layers/links/app/testing/fixtures';

vi.mock('vue-sonner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-sonner')>()),
  toast: { success: vi.fn(), error: vi.fn() }
}));

const LINKS = [
  makeLink({ id: 'link-1', slug: 'repo' }),
  makeLink({ id: 'link-2', slug: 'blog-post' }),
  makeLink({ id: 'link-3', slug: 'my-repo' })
];

const getLinks = vi.fn(() => ({ body: { links: LINKS } }));
const deleteLink = vi.fn(() => ({}));

registerEndpoint('/api/links', { method: 'GET', handler: getLinks });
registerEndpoint('/api/links/link-1', {
  method: 'DELETE',
  handler: deleteLink
});

const mountUseLinks = async () => {
  let links!: Awaited<ReturnType<typeof useLinks>>;

  await mountSuspended(
    defineComponent({
      async setup() {
        links = await useLinks();

        return () => h('div');
      }
    })
  );

  return links;
};

const slugsOf = (links: { slug: string }[]) => links.map((link) => link.slug);

beforeEach(() => {
  vi.clearAllMocks();
  clearNuxtData('links');
  useAlert().dismiss(false);
});

describe('useLinks', () => {
  it('loads the links', async () => {
    const { filteredLinks, hasLinks } = await mountUseLinks();

    expect(slugsOf(filteredLinks.value)).toEqual([
      'repo',
      'blog-post',
      'my-repo'
    ]);
    expect(hasLinks.value).toBe(true);
  });

  it.each([
    ['repo', ['repo', 'my-repo']],
    ['REPO', ['repo', 'my-repo']],
    ['/Repo', ['repo', 'my-repo']],
    ['  blog ', ['blog-post']],
    ['', ['repo', 'blog-post', 'my-repo']]
  ])('filters by slug for the query %j', async (query, expected) => {
    const { searchQuery, filteredLinks } = await mountUseLinks();

    searchQuery.value = query;

    expect(slugsOf(filteredLinks.value)).toEqual(expected);
  });

  it('reports when the search matches nothing', async () => {
    const { searchQuery, hasLinks, hasFilteredLinks } = await mountUseLinks();

    searchQuery.value = 'nothing-matches';

    expect(hasLinks.value).toBe(true);
    expect(hasFilteredLinks.value).toBe(false);
  });

  it('opens the form for creating and editing', async () => {
    const { isFormOpen, editingLink, openCreate, openEdit, onFormSuccess } =
      await mountUseLinks();

    openEdit(LINKS[1]!);

    expect(isFormOpen.value).toBe(true);
    expect(editingLink.value).toEqual(LINKS[1]);

    openCreate();

    expect(isFormOpen.value).toBe(true);
    expect(editingLink.value).toBeNull();

    await onFormSuccess();

    expect(isFormOpen.value).toBe(false);
    expect(getLinks).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the confirmation is cancelled', async () => {
    const { deleteLink: removeLink } = await mountUseLinks();

    const deletion = removeLink(LINKS[0]!);
    useAlert().dismiss(false);
    await deletion;

    expect(deleteLink).not.toHaveBeenCalled();
  });

  it('deletes after confirmation, then refreshes the links', async () => {
    const { deleteLink: removeLink } = await mountUseLinks();

    const deletion = removeLink(LINKS[0]!);
    useAlert().dismiss(true);
    await deletion;

    expect(deleteLink).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Link deleted successfully');
    expect(getLinks).toHaveBeenCalledTimes(2);
  });

  it('shows an error and allows retrying when the deletion fails', async () => {
    deleteLink.mockImplementationOnce(() => {
      throw createError({ statusCode: 500 });
    });
    const { deleteLink: removeLink } = await mountUseLinks();

    const deletion = removeLink(LINKS[0]!);
    useAlert().dismiss(true);
    await deletion;

    expect(toast.error).toHaveBeenCalledWith(
      'Something went wrong with your links'
    );

    const retry = removeLink(LINKS[0]!);
    useAlert().dismiss(true);
    await retry;

    expect(deleteLink).toHaveBeenCalledTimes(2);
  });
});
