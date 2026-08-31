import { IGif } from '@giphy/js-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaType, fetchGifs, isRateLimited } from '../lib/giphy';

const PAGE_SIZE = 30;

type FeedState = {
  gifs: IGif[];
  totalCount: number | null;
  loading: boolean; // first page in flight
  loadingMore: boolean;
  error: string | null;
  exhausted: boolean;
};

const initialState: FeedState = {
  gifs: [],
  totalCount: null,
  loading: true,
  loadingMore: false,
  error: null,
  exhausted: false,
};

/**
 * Paginated Giphy feed with request cancellation and id-dedup
 * (Giphy pages overlap, so appending blindly yields duplicate keys).
 */
export const useGifFeed = (query: string, type: MediaType) => {
  const [state, setState] = useState<FeedState>(initialState);
  // Generation guard: results from a superseded query never land.
  const generation = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const fetchingMore = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // exponential backoff for 429s — hammering a rate-limited key digs the hole deeper
  const retryDelay = useRef(30_000);

  const runFetch = useCallback(
    async (offset: number, currentGeneration: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const page = await fetchGifs(
          query,
          type,
          offset,
          PAGE_SIZE,
          controller.signal,
        );
        if (generation.current !== currentGeneration) return;
        retryDelay.current = 30_000;
        setState((prev) => {
          const existing = offset === 0 ? [] : prev.gifs;
          const seen = new Set(existing.map((gif) => gif.id));
          const fresh = page.gifs.filter((gif) => !seen.has(gif.id));
          const gifs = [...existing, ...fresh];
          return {
            gifs,
            totalCount: page.totalCount,
            loading: false,
            loadingMore: false,
            error: null,
            exhausted: page.count === 0 || gifs.length >= page.totalCount,
          };
        });
      } catch (err) {
        if (
          controller.signal.aborted ||
          generation.current !== currentGeneration
        )
          return;
        const rateLimited = isRateLimited(err);
        const message = rateLimited
          ? "Giphy's free-tier rate limit is catching its breath — retrying automatically."
          : err instanceof Error
            ? err.message
            : 'Network error';
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: message,
        }));
        if (rateLimited) {
          clearTimeout(retryTimer.current);
          retryTimer.current = setTimeout(() => {
            if (generation.current === currentGeneration)
              runFetch(offset, currentGeneration);
          }, retryDelay.current);
          retryDelay.current = Math.min(retryDelay.current * 2, 300_000);
        }
      } finally {
        fetchingMore.current = false;
      }
    },
    [query, type],
  );

  useEffect(() => {
    generation.current += 1;
    fetchingMore.current = false;
    clearTimeout(retryTimer.current);
    setState({ ...initialState });
    runFetch(0, generation.current);
    return () => {
      abortRef.current?.abort();
      clearTimeout(retryTimer.current);
    };
  }, [runFetch]);

  const loadMore = useCallback(() => {
    if (fetchingMore.current) return;
    setState((prev) => {
      if (prev.loading || prev.loadingMore || prev.exhausted || prev.error)
        return prev;
      fetchingMore.current = true;
      runFetch(prev.gifs.length, generation.current);
      return { ...prev, loadingMore: true };
    });
  }, [runFetch]);

  const retry = useCallback(() => {
    generation.current += 1;
    setState({ ...initialState });
    runFetch(0, generation.current);
  }, [runFetch]);

  return { ...state, loadMore, retry };
};
