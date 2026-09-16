import type { Link } from '#shared/types/link.type';
import { toast } from 'vue-sonner';

type LinksResponse = {
  statusCode: number;
  statusMessage: string;
  body: {
    links: Link[];
  };
};

export const useLinks = async () => {
  const { t: $t } = useI18n();
  const { alert } = useAlert();

  const { data, pending, refresh, error } = await useFetch<LinksResponse>(
    '/api/links',
    {
      key: 'links'
    }
  );

  const searchQuery = shallowRef('');
  const isFormOpen = shallowRef(false);
  const editingLink = shallowRef<Link | null>(null);
  const isDeleting = shallowRef(false);

  const links = computed(() => data.value?.body.links ?? []);

  const filteredLinks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    if (!query) return links.value;

    return links.value.filter((link) => link.link.includes(query));
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
      await $fetch(`/api/links/${link.id}`, {
        method: 'DELETE'
      });

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
    error,
    searchQuery,
    isFormOpen,
    editingLink,
    links,
    filteredLinks,
    hasLinks,
    hasFilteredLinks,
    openCreate,
    openEdit,
    closeForm,
    onFormSuccess,
    deleteLink,
    refresh
  };
};
