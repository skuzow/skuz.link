import type {
  ClickListFilter,
  ClickRange
} from '#layers/links/shared/domain/click.type';
import { toast } from 'vue-sonner';

import { CLICK_RANGE_DEFAULT } from '#layers/links/shared/domain/click.constant';
import {
  ClickCountrySchema,
  ClickRangeSchema
} from '#layers/links/shared/domain/click.schema';

// a range the page doesn't know reads as the default
const readRange = (value: unknown): ClickRange => {
  const result = ClickRangeSchema.safeParse(value);

  return result.success ? result.data : CLICK_RANGE_DEFAULT;
};

// only "true" shows Bots
const readBots = (value: unknown): boolean => value === 'true';

// a country the page doesn't read leaves the list unfiltered
const readCountry = (value: unknown): string | undefined => {
  const result = ClickCountrySchema.safeParse(value);

  return result.success ? result.data : undefined;
};

export const useLinkStatistics = async (id: string) => {
  const linkApi = useLinkApi();
  const route = useRoute();
  const router = useRouter();
  const { t: $t } = useI18n();

  const range = shallowRef(readRange(route.query.range));
  const bots = shallowRef(readBots(route.query.bots));
  // the country whose Clicks the list shows; it changes once they land
  const country = shallowRef(readCountry(route.query.country));
  const isLoading = shallowRef(false);
  const isFiltering = shallowRef(false);
  const isLoadingMore = shallowRef(false);

  const filter = (): ClickListFilter => ({
    range: range.value,
    bots: bots.value,
    country: country.value
  });

  const [linkData, statisticsData, clicksData] = await Promise.all([
    useAsyncData(`links:${id}`, () => linkApi.get(id)),
    useAsyncData(`links:${id}:statistics`, () =>
      linkApi.getStatistics(id, { range: range.value, bots: bots.value })
    ),
    useAsyncData(`links:${id}:clicks`, () => linkApi.getClicks(id, filter()))
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
  const clicks = computed(() => clicksData.data.value?.clicks ?? []);
  const hasMore = computed(() => !!clicksData.data.value?.cursor);

  // the defaults, 30 days, no Bots and every country, stay out of the
  // address, and a change replaces the current entry, so Back still returns
  // to the Links page
  const writeFilter = (next: ClickListFilter) => {
    const query = { ...route.query };

    if (next.range === CLICK_RANGE_DEFAULT) delete query.range;
    else query.range = next.range;

    if (next.bots) query.bots = 'true';
    else delete query.bots;

    if (next.country) query.country = next.country;
    else delete query.country;

    return router.replace({ query });
  };

  // the filter of the figures and Clicks on screen, and the latest one asked
  // for; only the latest choice lands when several are in flight
  let shownFilter = filter();
  let wantedFilter = shownFilter;
  let latest = 0;
  // bumped whenever the list starts again from its first page, so a page
  // that was in flight for the old list never lands on the new one
  let listVersion = 0;

  // the figures follow the range and bots, so a new country alone fetches
  // only the first page; anything else fetches the figures with it
  const applyFilter = async (next: ClickListFilter) => {
    const request = ++latest;
    const withStatistics =
      next.range !== shownFilter.range || next.bots !== shownFilter.bots;

    wantedFilter = next;
    range.value = next.range;
    bots.value = next.bots;
    if (withStatistics) isLoading.value = true;
    else isFiltering.value = true;

    try {
      const [nextStatistics, nextClicks] = await Promise.all([
        withStatistics
          ? linkApi.getStatistics(id, { range: next.range, bots: next.bots })
          : null,
        linkApi.getClicks(id, next)
      ]);
      if (request !== latest) return;

      if (nextStatistics) statisticsData.data.value = nextStatistics;
      clicksData.data.value = nextClicks;
      country.value = next.country;
      listVersion++;
      shownFilter = next;
    } catch {
      if (request !== latest) return;

      // what was shown stays, so the controls go back to its filter
      wantedFilter = shownFilter;
      range.value = shownFilter.range;
      bots.value = shownFilter.bots;
      toast.error($t('toast.links.error'));
      return;
    } finally {
      if (request === latest) {
        isLoading.value = false;
        isFiltering.value = false;
      }
    }

    await writeFilter(next);
  };

  const setRange = async (next: ClickRange) => {
    if (next === wantedFilter.range) return;

    await applyFilter({ ...wantedFilter, range: next });
  };

  const setBots = async (next: boolean) => {
    if (next === wantedFilter.bots) return;

    await applyFilter({ ...wantedFilter, bots: next });
  };

  // picking the country already picked clears the filter
  const pickCountry = async (next: string) => {
    await applyFilter({
      ...wantedFilter,
      country: next === wantedFilter.country ? undefined : next
    });
  };

  const clearCountry = async () => {
    if (!wantedFilter.country) return;

    await applyFilter({ ...wantedFilter, country: undefined });
  };

  // the next page goes under the Clicks shown; on failure they stay
  const loadMore = async () => {
    const cursor = clicksData.data.value?.cursor;
    if (!cursor || isLoadingMore.value) return;

    const version = listVersion;
    isLoadingMore.value = true;

    try {
      const page = await linkApi.getClicks(id, { ...shownFilter, cursor });
      if (version !== listVersion) return;

      clicksData.data.value = {
        clicks: [...clicks.value, ...page.clicks],
        cursor: page.cursor
      };
    } catch {
      if (version !== listVersion) return;

      toast.error($t('toast.links.error'));
    } finally {
      isLoadingMore.value = false;
    }
  };

  return {
    link,
    statistics,
    clicks,
    hasMore,
    range,
    bots,
    country,
    isLoading,
    isFiltering,
    isLoadingMore,
    setRange,
    setBots,
    pickCountry,
    clearCountry,
    loadMore
  };
};
