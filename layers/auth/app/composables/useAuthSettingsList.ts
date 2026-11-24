// what better-auth's client answers: the list, or an error instead of throwing
interface AuthSettingsListAnswer<T> {
  data: T[] | null;
  error: { message?: string } | null;
}

// a Settings list, such as Sessions or Connected accounts, loaded when Settings opens
export const useAuthSettingsList = <T>(
  key: string,
  load: () => Promise<AuthSettingsListAnswer<T>>
) => {
  const {
    status,
    error,
    refresh,
    data: items
  } = useLazyAsyncData(key, async () => {
    const { data, error } = await load();
    if (error) throw new Error(error.message);

    return data ?? [];
  });

  // until the first answer: a failed list keeps its error while it loads again
  const isLoading: ComputedRef<boolean> = computed(
    () => !items.value && !error.value
  );

  const isFailed: ComputedRef<boolean> = computed(() => !!error.value);

  const isRetrying: ComputedRef<boolean> = computed(
    () => isFailed.value && status.value === 'pending'
  );

  // only once the list has loaded, and kept while it reloads after Revoke or Disconnect:
  // the count is the number of rows below it
  const count: ComputedRef<number | undefined> = computed(() =>
    isFailed.value ? undefined : items.value?.length
  );

  return { items, count, isLoading, isFailed, isRetrying, refresh };
};
