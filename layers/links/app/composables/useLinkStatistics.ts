import type {
  Click,
  ClickListFilter,
  ClickRange,
  ClicksPage
} from '#layers/links/shared/domain/click.type';
import { toast } from 'vue-sonner';

import {
  CLICK_RANGE_DEFAULT,
  CLICK_RANGE_MS,
  CLICKS_PAGE_SIZE
} from '#layers/links/shared/domain/click.constant';
import {
  ClickCountrySchema,
  ClickRangeSchema
} from '#layers/links/shared/domain/click.schema';

// newest first, by time and then by id, as the server lists them
const byNewest = (a: Click, b: Click) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
  b.id - a.id;

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

type FetchFailure = Error & { statusMessage?: string };

const isNotFound = (error: unknown): error is FetchFailure =>
  error instanceof Error && 'statusCode' in error && error.statusCode === 404;

export const useLinkStatistics = async (id: string) => {
  const linkApi = useLinkApi();
  const route = useRoute();
  const router = useRouter();
  const { t: $t } = useI18n();

  // fatal, so the not-found ErrorPage takes the page's place
  const showNotFound = (error: FetchFailure) =>
    showError({ status: 404, statusText: error.statusMessage, fatal: true });

  // a 404 at any point, such as for a Link deleted in another tab, shows the
  // not-found ErrorPage; anything else shows the toast
  const showFailure = (error: unknown) => {
    if (isNotFound(error)) showNotFound(error);
    else toast.error($t('toast.links.error'));
  };

  const range = shallowRef(readRange(route.query.range));
  const bots = shallowRef(readBots(route.query.bots));
  // the country whose Clicks the list shows; it changes once they land
  const country = shallowRef(readCountry(route.query.country));
  const isLoading = shallowRef(false);
  const isFiltering = shallowRef(false);
  const isLoadingMore = shallowRef(false);
  // the Clicks the last refresh brought in, which flash on top
  const freshIds = shallowRef<ReadonlySet<number>>(new Set());
  // the refreshes that have landed, each of which blinks the Live LED
  const refreshes = shallowRef(0);

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
    // the rows give way to Skeletons and mount again, so they must not
    // flash a second time
    freshIds.value = new Set();
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
    } catch (error) {
      if (request !== latest) return;

      // what was shown stays, so the controls go back to its filter
      wantedFilter = shownFilter;
      range.value = shownFilter.range;
      bots.value = shownFilter.bots;
      showFailure(error);
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

      // a Click saved late may already have come in through a refresh, and
      // sit below the page in time
      const shownIds = new Set(clicks.value.map((click) => click.id));
      clicksData.data.value = {
        clicks: [
          ...clicks.value,
          ...page.clicks.filter((click) => !shownIds.has(click.id))
        ].sort(byNewest),
        cursor: page.cursor
      };
    } catch (error) {
      if (version !== listVersion) return;

      showFailure(error);
    } finally {
      isLoadingMore.value = false;
    }
  };

  // the id of the last saved Click shown, so a refresh asks only for the
  // Clicks saved after it: a Click's time is taken before its row is saved,
  // so one saved late can be older than the newest Click shown. None while
  // the list is empty, so the first page comes whole
  const lastSavedShown = () =>
    clicks.value.length > 0
      ? Math.max(...clicks.value.map((click) => click.id))
      : undefined;

  // one at a time, so two refreshes never bring the same Clicks in
  let isRefreshing = false;

  // fresh figures, and the new Clicks in their place by time while the
  // Clicks that left the range go. A 404 shows the not-found ErrorPage; any
  // other failure shows nothing, and the next refresh tries again
  const refresh = async () => {
    if (isRefreshing) return;

    isRefreshing = true;
    const version = listVersion;
    const filterShown = shownFilter;
    const after = lastSavedShown();
    // taken as the requests leave, as close as the browser's clock gets to
    // the start the server counts from
    const start = Date.now() - CLICK_RANGE_MS[filterShown.range];

    try {
      const [nextStatistics, newer] = await Promise.all([
        linkApi.getStatistics(id, {
          range: filterShown.range,
          bots: filterShown.bots
        }),
        linkApi.getClicks(id, { ...filterShown, after })
      ]);

      // with no Click shown, newer is the first page whole; a full page may
      // leave a gap below it, so the first page comes again, with a cursor
      // of its own. Either takes the list's place
      let firstPage: ClicksPage | null = null;
      if (!after) firstPage = newer;
      else if (newer.clicks.length >= CLICKS_PAGE_SIZE) {
        firstPage = await linkApi.getClicks(id, filterShown);
      }
      if (version !== listVersion) return;

      statisticsData.data.value = nextStatistics;
      if (firstPage) {
        const shownIds = new Set(clicks.value.map((click) => click.id));

        clicksData.data.value = firstPage;
        freshIds.value = new Set(
          firstPage.clicks
            .filter((click) => !shownIds.has(click.id))
            .map((click) => click.id)
        );
        // a Load more in flight belongs to the old list
        listVersion++;
      } else {
        // the server counts only the Clicks since the range's start, so the
        // rows older than it go
        const inRange = clicks.value.filter(
          (click) => new Date(click.createdAt).getTime() >= start
        );
        const hasLeftRange = inRange.length < clicks.value.length;

        // every Click past Load more's cursor is older still, so the cursor
        // goes with them, and a Load more in flight lands nothing
        clicksData.data.value = {
          clicks: [...newer.clicks, ...inRange].sort(byNewest),
          cursor: hasLeftRange ? null : (clicksData.data.value?.cursor ?? null)
        };
        freshIds.value = new Set(newer.clicks.map((click) => click.id));
        if (hasLeftRange) listVersion++;
      }
      refreshes.value++;
    } catch (error) {
      if (isNotFound(error)) showNotFound(error);
    } finally {
      isRefreshing = false;
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
    loadMore,
    refresh,
    freshIds,
    refreshes
  };
};
