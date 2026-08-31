import { IGif } from '@giphy/js-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  FaArrowTrendUp,
  FaDice,
  FaHeart,
  FaRegFaceSadTear,
} from 'react-icons/fa6';
import { cn } from './lib/cn';
import { FeedSkeleton } from './components/feed-skeleton';
import { GifCard } from './components/gif-card';
import { GifDetailModal } from './components/gif-detail-modal';
import { MasonryGrid } from './components/masonry-grid';
import { SearchBar } from './components/search-bar';
import { TrendingChips } from './components/trending-chips';
import { useFeedScroll } from './hooks/use-feed-scroll';
import { useGifFeed } from './hooks/use-gif-feed';
import { useInView } from './hooks/use-in-view';
import { useSearchState, type Tab } from './hooks/use-search-state';
import { useTrendingSearches } from './hooks/use-trending-searches';
import { useFavorites } from './lib/favorites';
import { fetchRandomGif, gifDisplayName } from './lib/giphy';

const TABS: { id: Tab; label: string }[] = [
  { id: 'gifs', label: 'GIFs' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'favorites', label: 'Favorites' },
];

const numberFormat = new Intl.NumberFormat();

const App = () => {
  const { input, setInput, query, tab, setTab, commitSearch } =
    useSearchState();
  const [selected, setSelected] = useState<IGif | null>(null);
  const trending = useTrendingSearches();
  const favorites = useFavorites();

  const browsing = tab !== 'favorites';
  const feed = useGifFeed(query, tab === 'stickers' ? 'stickers' : 'gifs');
  const {
    scrollRef,
    mainRef,
    scrolled,
    holdHeight,
    handleScroll,
    holdForTransition,
    resetToTop,
  } = useFeedScroll(feed.loading, tab);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const sentinelInView = useInView(sentinelRef, '900px');

  const switchTab = useCallback(
    (next: Tab) => {
      if (next === tab) return;
      holdForTransition();
      setTab(next);
    },
    [tab, holdForTransition, setTab],
  );

  useEffect(() => {
    resetToTop();
  }, [query, resetToTop]);

  useEffect(() => {
    if (sentinelInView && browsing) feed.loadMore();
  }, [sentinelInView, browsing, feed.loadMore, feed]);

  const surpriseMe = async () => {
    try {
      setSelected(await fetchRandomGif(query || undefined));
    } catch {
      toast.error("Couldn't fetch a random GIF");
    }
  };

  const filteredFavorites = useMemo(() => {
    if (!query) return favorites;
    const needle = query.toLowerCase();
    return favorites.filter(
      (gif) =>
        gif.title?.toLowerCase().includes(needle) ||
        gifDisplayName(gif).toLowerCase().includes(needle),
    );
  }, [favorites, query]);

  const gridGifs = browsing ? feed.gifs : filteredFavorites;
  const renderCard = useCallback(
    (gif: IGif, index: number) => (
      <GifCard
        key={gif.id}
        gif={gif}
        staggerIndex={index}
        onSelect={setSelected}
      />
    ),
    [],
  );

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className='h-full w-full overflow-y-auto [scrollbar-gutter:stable_both-edges]'
    >
      {/* hero */}
      <header className='relative flex flex-col items-center gap-2.5 px-4 pb-6 pt-14'>
        <div className='hero-glow' aria-hidden />
        <h1 className='logo-text text-6xl sm:text-7xl'>GIFster</h1>
        <p className='flex items-center gap-2.5 text-[13px] text-white/45'>
          <span className='italic'>“We're not GIPHY, damn it”</span>
          <span className='h-1 w-1 rounded-full bg-white/25' aria-hidden />
          <span className='tracking-wider'>
            by{' '}
            <a
              href='https://scottjhetrick.com'
              target='_blank'
              rel='noreferrer'
              className='text-white/60 transition-colors hover:text-white'
            >
              Scott Hetrick
            </a>
          </span>
        </p>
      </header>

      {/* sticky search — transparent while at the top so it doesn't cut a
          dark band across the hero gradient; surfaces once you scroll */}
      <div
        className={cn(
          'sticky top-0 z-20 flex justify-center px-4 py-3 transition-colors duration-300',
          scrolled &&
            'bg-[#0b0b11]/80 shadow-lg shadow-black/20 backdrop-blur-lg',
        )}
      >
        <SearchBar value={input} onChange={setInput} onCommit={commitSearch} />
      </div>

      <main
        ref={mainRef}
        style={holdHeight ? { minHeight: holdHeight } : undefined}
        className='mx-auto flex w-full max-w-[1600px] flex-col items-center gap-4 px-4 pb-4 pt-3 sm:px-6'
      >
        <TrendingChips
          terms={trending}
          activeTerm={query}
          onSelect={commitSearch}
        />

        {/* tabs + context row */}
        <div className='flex w-full flex-wrap items-center gap-2'>
          <div className='flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10'>
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  tab === id
                    ? 'bg-white text-black shadow'
                    : 'text-white/60 hover:text-white',
                )}
                onClick={() => switchTab(id)}
              >
                {id === 'favorites' && (
                  <FaHeart className='text-xs text-pink-500' />
                )}
                {label}
                {id === 'favorites' && favorites.length > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-xs',
                      tab === id ? 'bg-black/10' : 'bg-white/10',
                    )}
                  >
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className='ml-auto flex items-center gap-3'>
            {browsing && !feed.loading && feed.totalCount !== null && (
              <span className='hidden text-sm text-white/40 sm:block'>
                {query ? (
                  <>
                    {numberFormat.format(feed.totalCount)} results for “{query}”
                  </>
                ) : (
                  <span className='flex items-center gap-1.5'>
                    <FaArrowTrendUp /> Trending now
                  </span>
                )}
              </span>
            )}
            <button
              className='flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-sm font-medium text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-white'
              onClick={surpriseMe}
            >
              <FaDice />
              Surprise me
            </button>
          </div>
        </div>

        {/* feed */}
        {browsing ? (
          <>
            {feed.loading && <FeedSkeleton />}
            {!feed.loading && feed.error && (
              <div className='flex flex-col items-center gap-3 py-16 text-center'>
                <p className='text-lg font-medium text-white/80'>
                  Something broke fetching GIFs
                </p>
                <p className='max-w-sm text-sm text-white/40'>{feed.error}</p>
                <button
                  className='rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20'
                  onClick={feed.retry}
                >
                  Try again
                </button>
              </div>
            )}
            {!feed.loading && !feed.error && gridGifs.length === 0 && (
              <div className='flex flex-col items-center gap-3 py-16 text-center'>
                <FaRegFaceSadTear className='text-4xl text-white/30' />
                <p className='text-lg font-medium text-white/80'>
                  No results for “{query}”
                </p>
                <p className='text-sm text-white/40'>
                  Try one of the trending searches above.
                </p>
              </div>
            )}
            {!feed.loading && gridGifs.length > 0 && (
              <MasonryGrid gifs={gridGifs} renderItem={renderCard} />
            )}
            <div ref={sentinelRef} className='h-px w-full' />
            {feed.loadingMore && (
              <div className='py-4 text-sm text-white/40'>Loading more…</div>
            )}
            {feed.exhausted && gridGifs.length > 0 && (
              <div className='py-4 text-sm text-white/30'>
                That's every last one. Impressive scrolling.
              </div>
            )}
          </>
        ) : (
          <>
            {gridGifs.length > 0 ? (
              <MasonryGrid gifs={gridGifs} renderItem={renderCard} />
            ) : (
              <div className='flex flex-col items-center gap-3 py-16 text-center'>
                <FaHeart className='text-4xl text-pink-500/40' />
                <p className='text-lg font-medium text-white/80'>
                  {query ? `No favorites match “${query}”` : 'No favorites yet'}
                </p>
                <p className='max-w-sm text-sm text-white/40'>
                  Hover any GIF and hit the heart — favorites live in your
                  browser, no account needed.
                </p>
              </div>
            )}
          </>
        )}

        <footer className='mt-8 pb-6 text-xs text-white/25'>
          Powered by GIPHY · Built by Scott Hetrick ·{' '}
          <a
            href='https://scottjhetrick.com'
            target='_blank'
            rel='noreferrer'
            className='underline hover:text-white/50'
          >
            scottjhetrick.com
          </a>
        </footer>
      </main>

      <GifDetailModal
        gif={selected}
        onClose={() => setSelected(null)}
        onSelect={setSelected}
      />
    </div>
  );
};

export { App };
