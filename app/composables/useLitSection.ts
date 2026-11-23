import type { MaybeRefOrGetter } from 'vue';
import { litSection } from '~/lib/litSection';

// the line a section heading passes as the reader reaches it: 88px from the
// top, under the Header
const READING_LINE = 88;

// the section id in a location hash; a malformed escape stays as it is
const hashId = (hash: string) => {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
};

// Tracks which of the section headings with these ids the reader is in, on the
// client only. A jump (jumpTo on an index click, or a #section in the address
// on load or after Back and Forward) lights the chosen section until the
// reader scrolls. Stores nothing.
export const useLitSection = (ids: MaybeRefOrGetter<string[]>) => {
  // the lit heading's id, or null for none
  const litId = ref<string | null>(null);

  // the id of the heading jumped to, until the reader scrolls
  let jumpId: string | null = null;
  let observer: IntersectionObserver | undefined;
  let frame = 0;

  const headings = () =>
    toValue(ids).flatMap((id) => document.getElementById(id) ?? []);

  const atEnd = () =>
    Math.ceil(window.scrollY + window.innerHeight) >=
    document.documentElement.scrollHeight;

  const update = () => {
    const elements = headings();
    const jump = elements.findIndex((element) => element.id === jumpId);
    const index = litSection({
      tops: elements.map((element) => element.getBoundingClientRect().top),
      line: READING_LINE,
      atEnd: atEnd(),
      jump: jump === -1 ? undefined : jump
    });

    litId.value = index === null ? null : (elements[index]?.id ?? null);
  };

  const schedule = () => {
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  // A jump scrolls the page too, so its own scroll must not clear it. A
  // landed heading sits at its scroll margin, or lower when the page ends
  // before it can scroll that far. Any other position is the reader's.
  const landed = (id: string) => {
    const heading = document.getElementById(id);
    if (!heading) return false;

    const top = heading.getBoundingClientRect().top;
    const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop);

    return Math.abs(top - margin) <= 1 || (top > margin && atEnd());
  };

  const onScroll = () => {
    if (jumpId !== null && !landed(jumpId)) jumpId = null;
    schedule();
  };

  const jumpTo = (id: string) => {
    jumpId = toValue(ids).includes(id) ? id : null;
    update();
  };

  // Back and Forward between two sections at the end of the page don't
  // scroll, so the new hash is the only sign of the jump. Any hash that isn't
  // a section, or none, hands back to the normal rule
  const onHashChange = () => jumpTo(hashId(window.location.hash));

  // the observer catches headings moved without a scroll too, as when the
  // fold opens or the window resizes
  const observe = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(schedule, {
      rootMargin: `-${READING_LINE}px 0px 0px 0px`,
      threshold: [0, 1]
    });
    for (const heading of headings()) observer.observe(heading);
    update();
  };

  watch(
    () => toValue(ids),
    () => {
      jumpId = null;
      observe();
    },
    { flush: 'post' }
  );

  onMounted(() => {
    // a section in the address on load is a jump too
    onHashChange();
    observe();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onHashChange);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('hashchange', onHashChange);
  });

  return { litId: readonly(litId), jumpTo };
};
