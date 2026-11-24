import type { ClickRange } from '#layers/links/shared/domain/click.type';
import { toast } from 'vue-sonner';

import { CLICK_RANGE_DEFAULT } from '#layers/links/shared/domain/click.constant';
import { ClickRangeSchema } from '#layers/links/shared/domain/click.schema';

// a range the page doesn't know reads as the default
const readRange = (value: unknown): ClickRange => {
  const result = ClickRangeSchema.safeParse(value);

  return result.success ? result.data : CLICK_RANGE_DEFAULT;
};

export const useLinkStatistics = async (id: string) => {
  const linkApi = useLinkApi();
  const route = useRoute();
  const router = useRouter();
  const { t: $t } = useI18n();

  const range = shallowRef(readRange(route.query.range));
  const isLoading = shallowRef(false);

  const [linkData, statisticsData, clicksData] = await Promise.all([
    useAsyncData(`links:${id}`, () => linkApi.get(id)),
    useAsyncData(`links:${id}:statistics`, () =>
      linkApi.getStatistics(id, { range: range.value })
    ),
    useAsyncData(`links:${id}:clicks`, () =>
      linkApi.getClicks(id, { range: range.value })
    )
  ]);

  // fatal, so a 404 shows the not-found ErrorPage and anything else the
  // ErrorPage with its status
  const error =
    linkData.error.value ??
    statisticsData.error.value ??
    clicksData.error.value;
  if (error || !linkData.data.value || !statisticsData.data.value) {
    throw createError({
      status: error?.status ?? 500,
      statusText: error?.statusText,
      fatal: true
    });
  }

  const link = computed(() => linkData.data.value!);
  const statistics = computed(() => statisticsData.data.value!);
  const clicks = computed(() => clicksData.data.value ?? []);

  // the default stays out of the address, and a change replaces the current
  // entry, so Back still returns to the Links page
  const writeRange = (next: ClickRange) => {
    const query = { ...route.query };
    if (next === CLICK_RANGE_DEFAULT) delete query.range;
    else query.range = next;

    return router.replace({ query });
  };

  // the range of the figures and Clicks on screen; only the latest choice
  // lands when several are in flight
  let shownRange = range.value;
  let latest = 0;

  const setRange = async (next: ClickRange) => {
    if (next === range.value) return;

    const request = ++latest;

    range.value = next;
    isLoading.value = true;

    try {
      const [nextStatistics, nextClicks] = await Promise.all([
        linkApi.getStatistics(id, { range: next }),
        linkApi.getClicks(id, { range: next })
      ]);
      if (request !== latest) return;

      statisticsData.data.value = nextStatistics;
      clicksData.data.value = nextClicks;
      shownRange = next;
    } catch {
      if (request !== latest) return;

      // what was shown stays, so the switcher goes back to its range
      range.value = shownRange;
      toast.error($t('toast.links.error'));
      return;
    } finally {
      if (request === latest) isLoading.value = false;
    }

    await writeRange(next);
  };

  return { link, statistics, clicks, range, isLoading, setRange };
};
