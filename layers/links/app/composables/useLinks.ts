import type { Link } from '#layers/links/shared/domain/link.type';
import { toast } from 'vue-sonner';

import { normalizeLinkSlug } from '#layers/links/shared/domain/link.schema';

export const useLinks = async () => {
  const { $api } = useNuxtApp();
  const { t: $t } = useI18n();
  const { alert } = useAlert();

  const { data, pending, refresh } = await useAsyncData('links', () =>
    $api.link.getAll()
  );

  const searchQuery = shallowRef('');
  const isFormOpen = shallowRef(false);
  const editingLink = shallowRef<Link | null>(null);
  const isDeleting = shallowRef(false);

  const links = computed(() => data.value?.body.links ?? []);

  const filteredLinks = computed(() => {
    const query = normalizeLinkSlug(searchQuery.value);

    if (!query) return links.value;

    return links.value.filter((link) => link.slug.includes(query));
  });

  const hasLinks = computed(() => links.value.length > 0);
  const hasFilteredLinks = computed(() => filteredLinks.value.length > 0);

  const openCreate = () => {
    editingLink.value = null;
    isFormOpen.value = true;
  };

  const openEdit = (link: Link) => {
    editingLink.value = link;
    isFormOpen.value = true;
  };

  const closeForm = () => {
    isFormOpen.value = false;
    editingLink.value = null;
  };

  const onFormSuccess = async () => {
    closeForm();
    await refresh();
  };

  const deleteLink = async (link: Link) => {
    if (isDeleting.value) return;

    const confirmed = await alert({
      title: $t('alert.links.delete.title'),
      description: $t('alert.links.delete.description'),
      danger: true
    });

    if (!confirmed) return;

    isDeleting.value = true;

    try {
      await $api.link.delete(link.id);

      toast.success($t('toast.links.delete.title'));

      await refresh();
    } catch {
      toast.error($t('toast.links.error'));
    } finally {
      isDeleting.value = false;
    }
  };

  return {
    pending,
    searchQuery,
    isFormOpen,
    editingLink,
    filteredLinks,
    hasLinks,
    hasFilteredLinks,
    openCreate,
    openEdit,
    onFormSuccess,
    deleteLink
  };
};
