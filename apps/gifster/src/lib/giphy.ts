import { IGif } from '@giphy/js-types';

export type MediaType = 'gifs' | 'stickers';

export type GifPage = {
  gifs: IGif[];
  totalCount: number;
  offset: number;
  count: number;
};

const API_BASE = 'https://api.giphy.com/v1';
const API_KEY = import.meta.env.VITE_GIPHY_API_KEY as string;

export class GiphyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const isRateLimited = (err: unknown): boolean =>
  err instanceof GiphyError && err.status === 429;

/* Giphy free keys have tight rate limits (historically ~42 reads/hour on
 * beta keys), so every read goes through a TTL memory cache with in-flight
 * dedupe: tab flips, repeated searches, and back-to-trending cost zero API
 * calls. Aborting a caller never cancels the shared fetch — an aborted HTTP
 * request still counts against the quota, so there's nothing to save. */
const memCache = new Map<string, { at: number; data: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

const TTL_RULES: [RegExp, number][] = [
  [/\/trending\/searches/, 10 * 60_000],
  [/\/search\/tags/, 30 * 60_000],
  [/\/related/, 60 * 60_000],
  [/\/(gifs|stickers)\/(search|trending)/, 10 * 60_000],
];
const ttlFor = (path: string): number =>
  TTL_RULES.find(([re]) => re.test(path))?.[1] ?? 0;

const raceWithSignal = <T>(promise: Promise<T>, signal?: AbortSignal) => {
  if (!signal) return promise;
  return new Promise<T>((resolve, reject) => {
    const onAbort = () =>
      reject(new DOMException('Aborted', 'AbortError'));
    if (signal.aborted) return onAbort();
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      },
    );
  });
};

const request = <T>(
  path: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> => {
  const cacheKey = `${path}?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, String(v)]),
    ),
  )}`;
  const ttl = ttlFor(path);

  const hit = memCache.get(cacheKey);
  if (ttl && hit && Date.now() - hit.at < ttl)
    return raceWithSignal(Promise.resolve(hit.data as T), signal);

  const pending = inFlight.get(cacheKey);
  if (pending) return raceWithSignal(pending as Promise<T>, signal);

  const fetchPromise = (async () => {
    const url = new URL(`${API_BASE}${path}`);
    url.searchParams.set('api_key', API_KEY);
    for (const [key, value] of Object.entries(params))
      url.searchParams.set(key, String(value));

    const response = await fetch(url);
    const json = await response.json().catch(() => ({}));
    const status = json?.meta?.status ?? response.status;
    if (status !== 200)
      throw new GiphyError(
        json?.meta?.msg || `Request failed (${status})`,
        status,
      );
    if (ttl) memCache.set(cacheKey, { at: Date.now(), data: json });
    return json as T;
  })().finally(() => inFlight.delete(cacheKey));

  inFlight.set(cacheKey, fetchPromise);
  return raceWithSignal(fetchPromise, signal);
};

type ListResponse = {
  data: IGif[];
  pagination: { total_count: number; count: number; offset: number };
};

const toPage = (json: ListResponse): GifPage => ({
  gifs: json.data,
  totalCount: json.pagination?.total_count ?? json.data.length,
  offset: json.pagination?.offset ?? 0,
  count: json.pagination?.count ?? json.data.length,
});

/** Search GIFs or stickers. Trending feed when the query is empty. */
export const fetchGifs = async (
  query: string,
  type: MediaType,
  offset: number,
  limit: number,
  signal?: AbortSignal,
): Promise<GifPage> => {
  const path = query ? `/${type}/search` : `/${type}/trending`;
  const params: Record<string, string | number> = { limit, offset };
  if (query) params.q = query;
  return toPage(await request<ListResponse>(path, params, signal));
};

export const fetchTrendingSearches = async (
  signal?: AbortSignal,
): Promise<string[]> => {
  const json = await request<{ data: string[] }>(
    '/trending/searches',
    {},
    signal,
  );
  return json.data ?? [];
};

export const fetchSearchSuggestions = async (
  query: string,
  signal?: AbortSignal,
): Promise<string[]> => {
  const json = await request<{ data: { name: string }[] }>(
    '/gifs/search/tags',
    { q: query, limit: 8 },
    signal,
  );
  return (json.data ?? []).map((tag) => tag.name);
};

export const fetchRelatedGifs = async (
  gifId: string,
  signal?: AbortSignal,
): Promise<IGif[]> => {
  const json = await request<ListResponse>(
    '/gifs/related',
    { gif_id: gifId, limit: 12 },
    signal,
  );
  return json.data ?? [];
};

export const fetchRandomGif = async (tag?: string): Promise<IGif> => {
  const params: Record<string, string | number> = {};
  if (tag) params.tag = tag;
  const json = await request<{ data: IGif }>('/gifs/random', params);
  return json.data;
};

/* ---- rendition helpers ----
 * The API reports width/height as strings at runtime despite the typings,
 * so everything numeric goes through Number(). */

export const gifAspectRatio = (gif: IGif): number => {
  const rendition = gif.images.fixed_width ??
    gif.images.original ?? { width: 1, height: 1 };
  const width = Number(rendition.width) || 1;
  const height = Number(rendition.height) || 1;
  return width / height;
};

/** Small mp4 for the grid; falls back through renditions since not every GIF has all of them. */
export const gridVideoUrl = (gif: IGif): string =>
  gif.images.fixed_width?.mp4 ||
  gif.images.original_mp4?.mp4 ||
  gif.images.original?.mp4 ||
  '';

export const gridPosterUrl = (gif: IGif): string =>
  gif.images.fixed_width_still?.url || gif.images.original_still?.url || '';

export const fullVideoUrl = (gif: IGif): string =>
  gif.images.original?.mp4 || gif.images.original_mp4?.mp4 || gridVideoUrl(gif);

/** The shareable .gif file itself. */
export const gifFileUrl = (gif: IGif): string =>
  gif.images.original?.url || gif.images.downsized?.url || '';

export const thumbUrl = (gif: IGif): string =>
  gif.images.fixed_width_small?.webp ||
  gif.images.fixed_width_small?.url ||
  gif.images.fixed_width?.url ||
  '';

export const gifDisplayName = (gif: IGif): string =>
  gif.user?.display_name || gif.username || gif.source_tld || '';

export const gifProfileUrl = (gif: IGif): string =>
  (gif.user as { profile_url?: string } | undefined)?.profile_url ||
  gif.user?.website_url ||
  gif.source ||
  '';
