import { IGif } from '@giphy/js-types';
import {
  memo,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { toast } from 'sonner';
import { FaHeart, FaLink } from 'react-icons/fa6';
import { MdVerified } from 'react-icons/md';
import { cn } from '../lib/cn';
import { toggleFavorite, useFavorites } from '../lib/favorites';
import {
  gifAspectRatio,
  gifDisplayName,
  gridPosterUrl,
  gridVideoUrl,
} from '../lib/giphy';
import { copyGifLink } from '../lib/share';
import { useInView } from '../hooks/use-in-view';

type Props = {
  gif: IGif;
  staggerIndex: number;
  onSelect: (gif: IGif) => void;
};

const GifCardInner = ({ gif, staggerIndex, onSelect }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Wide margin mounts the <video> just before it scrolls in; the tight one
  // drives play/pause so offscreen cards cost nothing. The mount is LATCHED:
  // unmounting on scroll-out forces a refetch+decode on every re-entry,
  // which reads as aggressive flicker on mobile. A paused offscreen video
  // is far cheaper than that.
  const nearView = useInView(cardRef, '600px');
  const inView = useInView(cardRef, '100px');
  const everNear = useRef(false);
  if (nearView) everNear.current = true;
  const showVideo = nearView || everNear.current;
  // The video sits on top of an always-mounted poster and cross-fades in
  // once it can actually render frames — swapping elements (or showing a
  // frameless video) flashes on mobile. With preload=auto it usually
  // becomes ready while still below the viewport, so the fade is invisible.
  const [videoReady, setVideoReady] = useState(false);
  const favorites = useFavorites();
  const favorited = favorites.some((entry) => entry.id === gif.id);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) video.play().catch(() => undefined);
    else video.pause();
  }, [inView, nearView]);

  const handleFavorite = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const nowFavorite = toggleFavorite(gif);
    toast(nowFavorite ? 'Saved to favorites' : 'Removed from favorites', {
      duration: 1500,
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'gif-card group relative w-full cursor-pointer overflow-hidden rounded-xl',
        'bg-white/[0.04] ring-1 ring-white/5 transition-transform duration-200',
        'hover:z-10 hover:scale-[1.02] hover:ring-white/20',
        gif.is_sticker && 'sticker-bg',
      )}
      style={{
        aspectRatio: `${gifAspectRatio(gif)}`,
        ['--stagger' as string]: staggerIndex % 10,
      }}
      onClick={() => onSelect(gif)}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(gif);
        }
      }}
      aria-label={gif.title || 'GIF'}
    >
      {/* poster underlay — always mounted, the video fades in over it */}
      <img
        src={gridPosterUrl(gif)}
        alt=''
        className='h-full w-full object-cover'
      />
      {showVideo && (
        <video
          ref={videoRef}
          src={gridVideoUrl(gif)}
          playsInline
          muted
          loop
          preload='auto'
          onCanPlay={() => setVideoReady(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            videoReady ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      {/* hover actions */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 flex justify-end gap-1.5 p-2',
          'bg-gradient-to-b from-black/60 to-transparent pb-6',
          'opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100',
        )}
      >
        <button
          className={cn(
            'grid h-8 w-8 place-items-center rounded-full bg-black/50 text-sm text-white',
            'backdrop-blur transition-all hover:scale-110',
            favorited ? 'text-pink-500 opacity-100' : 'hover:text-pink-400',
          )}
          onClick={handleFavorite}
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <FaHeart className={cn(favorited && 'heart-pop')} />
        </button>
        <button
          className='grid h-8 w-8 place-items-center rounded-full bg-black/50 text-sm text-white backdrop-blur transition-all hover:scale-110 hover:text-cyan-300'
          onClick={(e) => {
            e.stopPropagation();
            copyGifLink(gif);
          }}
          aria-label='Copy GIF link'
        >
          <FaLink />
        </button>
      </div>

      {/* favorited indicator when not hovering */}
      {favorited && (
        <div className='absolute right-2 top-2 text-sm text-pink-500 drop-shadow group-hover:opacity-0'>
          <FaHeart />
        </div>
      )}

      {/* attribution */}
      {gifDisplayName(gif) && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex items-center gap-2 p-2 pt-6',
            'bg-gradient-to-t from-black/70 to-transparent',
            'opacity-0 transition-opacity duration-200 group-hover:opacity-100',
          )}
        >
          {gif.user?.avatar_url && (
            <img src={gif.user.avatar_url} alt='' className='h-6 w-6 rounded' />
          )}
          <span className='truncate text-xs font-medium text-white'>
            {gifDisplayName(gif)}
          </span>
          {gif.user?.is_verified && (
            <MdVerified className='shrink-0 text-xs text-cyan-400' />
          )}
        </div>
      )}
    </div>
  );
};

// memo keeps hundreds of mounted cards cheap as pages append; the
// useFavorites subscription still re-renders cards when favorites change.
const GifCard = memo(GifCardInner);

export { GifCard };
