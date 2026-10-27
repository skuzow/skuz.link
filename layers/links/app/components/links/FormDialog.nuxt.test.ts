import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { DOMWrapper, flushPromises } from '@vue/test-utils';
import { createError, readBody } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'vue-sonner';
import { makeLink } from '#layers/links/app/testing/fixtures';
import LinksFormDialog from './FormDialog.vue';

vi.mock('vue-sonner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-sonner')>()),
  toast: { success: vi.fn(), error: vi.fn() }
}));

const createLink = vi.fn(async (event) => makeLink(await readBody(event)));
const updateLink = vi.fn(async (event) => makeLink(await readBody(event)));

registerEndpoint('/api/links', { method: 'POST', handler: createLink });
registerEndpoint('/api/links/link-1', { method: 'PUT', handler: updateLink });

const mountDialog = async (link: ReturnType<typeof makeLink> | null = null) => {
  const onSuccess = vi.fn();
  const wrapper = await mountSuspended(LinksFormDialog, {
    props: { open: false, link, onSuccess },
    attachTo: document.body
  });

  // the dialog only resets its fields when it opens
  await wrapper.setProps({ open: true });
  await flushPromises();

  const find = <T extends Element>(selector: string) => {
    const element = document.body.querySelector<T>(selector);
    if (!element) throw new Error(`Missing ${selector}`);

    return new DOMWrapper(element);
  };

  const fill = async (fields: { slug?: string; redirectUrl?: string }) => {
    if (fields.slug !== undefined) {
      await find<HTMLInputElement>('input[name="slug"]').setValue(fields.slug);
    }
    if (fields.redirectUrl !== undefined) {
      await find<HTMLInputElement>('input[name="redirectUrl"]').setValue(
        fields.redirectUrl
      );
    }
  };

  const submit = () => find('form').trigger('submit');

  const input = (name: string) =>
    find<HTMLInputElement>(`input[name="${name}"]`).element;

  return { wrapper, onSuccess, fill, submit, input };
};

const dialogText = () => document.body.textContent ?? '';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('LinksFormDialog', () => {
  it('creates a link with the normalized slug', async () => {
    const { fill, submit, onSuccess } = await mountDialog();

    expect(dialogText()).toContain('Choose a slug and the URL to redirect to.');

    await fill({ slug: ' /Repo ', redirectUrl: 'https://example.com/repo' });
    await submit();

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(createLink).toHaveBeenCalledTimes(1);
    expect(await createLink.mock.results[0]!.value).toMatchObject({
      slug: 'repo',
      redirectUrl: 'https://example.com/repo'
    });
    expect(toast.success).toHaveBeenCalledWith('Link created successfully');
  });

  it('prefills and updates an existing link', async () => {
    const link = makeLink({ id: 'link-1', slug: 'old-slug' });
    const { fill, submit, input, onSuccess } = await mountDialog(link);

    expect(dialogText()).toContain('Update the slug or the redirect URL.');

    expect(input('slug').value).toBe('old-slug');
    expect(input('redirectUrl').value).toBe(link.redirectUrl);

    await fill({ slug: 'new-slug' });
    await submit();

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(await updateLink.mock.results[0]!.value).toMatchObject({
      slug: 'new-slug',
      redirectUrl: link.redirectUrl
    });
    expect(createLink).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Link updated successfully');
  });

  it('marks the slug as taken on a 409', async () => {
    createLink.mockImplementationOnce(() => {
      throw createError({ statusCode: 409 });
    });
    const { fill, submit, onSuccess } = await mountDialog();

    await fill({ slug: 'taken', redirectUrl: 'https://example.com' });
    await submit();

    await vi.waitFor(() =>
      expect(dialogText()).toContain('Slug is already in use.')
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows an error toast for other failures', async () => {
    createLink.mockImplementationOnce(() => {
      throw createError({ statusCode: 500 });
    });
    const { fill, submit, onSuccess } = await mountDialog();

    await fill({ slug: 'broken', redirectUrl: 'https://example.com' });
    await submit();

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong with your links'
      )
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it.each([
    [
      { slug: '', redirectUrl: '' },
      ['Slug is required.', 'Redirect URL is required.']
    ],
    [
      { slug: 'Bad Slug!', redirectUrl: 'https://example.com' },
      [
        'Slug can only contain lowercase letters, numbers, hyphens and underscores.'
      ]
    ],
    [
      { slug: 'login', redirectUrl: 'https://example.com' },
      ['Slug is reserved.']
    ],
    [
      { slug: 'repo', redirectUrl: 'ftp://example.com' },
      ['Redirect URL must be a valid http(s) URL.']
    ],
    [
      { slug: 'repo', redirectUrl: 'not a url' },
      ['Redirect URL must be a valid http(s) URL.']
    ]
  ])('rejects %j without calling the API', async (fields, messages) => {
    const { fill, submit } = await mountDialog();

    await fill(fields);
    await submit();

    await vi.waitFor(() => {
      for (const message of messages) {
        expect(dialogText()).toContain(message);
      }
    });
    expect(createLink).not.toHaveBeenCalled();
  });
});
