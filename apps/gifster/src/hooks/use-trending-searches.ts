import { useEffect, useState } from 'react';
import { fetchTrendingSearches } from '../lib/giphy';

const CACHE_KEY = 'gifster:trending:v1';

const readCache = (): string[] => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
};

/**
 * Trending terms, stale-while-revalidate: last visit's list renders in the
 * first frame (no pill pop-in shifting the wrapped rows) and the fresh list
 * replaces it in the background. Terms change slowly, so swaps are rare.
 */
export const useTrendingSearches = (): string[] => {
  const [trending, setTrending] = useState<string[]>(readCache);

  useEffect(() => {
    fetchTrendingSearches()
      .then((terms) => {
        setTrending(terms);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(terms));
        } catch {
          // private mode / quota — cache is best-effort
        }
      })
      .catch(() => undefined);
  }, []);

  return trending;
};
