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

class GiphyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(
  path: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> => {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('api_key', API_KEY);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, String(value));

  const response = await fetch(url, { signal });
  const json = await response.json();
  const status = json?.meta?.status ?? response.status;
  if (status !== 200)
    throw new GiphyError(
      json?.meta?.msg || `Request failed (${status})`,
      status,
    );
  return json as T;
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
