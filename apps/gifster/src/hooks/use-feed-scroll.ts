import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react';

/**
 * Scroll behavior for the feed container:
 *
 * - `scrolled` drives the sticky search bar's surfaced state.
 * - `holdHeight` is a min-height floor applied to <main> across tab
 *   transitions. Without it, swapping a tall grid for a short loading
 *   skeleton makes the browser clamp the scroll position — a forced jump.
 *   The floor is released as soon as the incoming tab's real content is in
 *   (`loading` false), so a legitimately short tab clamps naturally.
 * - Tab switches never move the scroll; only a new query resets it.
 *
 * `releaseKey` is any value that changes when the visible content context
 * changes (the active tab) — it re-runs the release check for switches that
 * don't toggle `loading` at all (e.g. entering the favorites tab).
 */
export const useFeedScroll = (loading: boolean, releaseKey: unknown) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [holdHeight, setHoldHeight] = useState<number | null>(null);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const isScrolled = e.currentTarget.scrollTop > 8;
    setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
  }, []);

  /** Call right before a tab switch commits. */
  const holdForTransition = useCallback(() => {
    const el = mainRef.current;
    if (el) setHoldHeight(el.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    if (!loading) setHoldHeight(null);
  }, [loading, releaseKey]);

  /** New search: drop the floor and start from the top. */
  const resetToTop = useCallback(() => {
    setHoldHeight(null);
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  return {
    scrollRef,
    mainRef,
    scrolled,
    holdHeight,
    handleScroll,
    holdForTransition,
    resetToTop,
  };
};
