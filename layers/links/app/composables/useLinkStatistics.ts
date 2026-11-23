export const useLinkStatistics = async (id: string) => {
  const linkApi = useLinkApi();

  const [linkData, clicksData] = await Promise.all([
    useAsyncData(`links:${id}`, () => linkApi.get(id)),
    useAsyncData(`links:${id}:clicks`, () => linkApi.getClicks(id))
  ]);

  // fatal, so a 404 shows the not-found ErrorPage and anything else the
  // ErrorPage with its status
  const error = linkData.error.value ?? clicksData.error.value;
  if (error || !linkData.data.value) {
    throw createError({
      status: error?.status ?? 500,
      statusText: error?.statusText,
      fatal: true
    });
  }

  const link = computed(() => linkData.data.value!);
  const clicks = computed(() => clicksData.data.value ?? []);

  return { link, clicks };
};
