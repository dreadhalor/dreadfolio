import { IGif } from '@giphy/js-types';
import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useRef, useState } from 'react';
import {
  FaCode,
  FaDownload,
  FaHeart,
  FaLink,
  FaRegHeart,
  FaUpRightFromSquare,
  FaXmark,
} from 'react-icons/fa6';
import { MdVerified } from 'react-icons/md';
import { cn } from '../lib/cn';
import { toggleFavorite, useFavorites } from '../lib/favorites';
import {
  fetchRelatedGifs,
  fullVideoUrl,
  gifDisplayName,
  gifProfileUrl,
  thumbUrl,
} from '../lib/giphy';
import { copyEmbedCode, copyGifLink, downloadGif } from '../lib/share';

type Props = {
  gif: IGif | null;
  onClose: () => void;
  onSelect: (gif: IGif) => void;
};

const GIF_ACTIONS: {
  label: string;
  Icon: typeof FaLink;
  run: (gif: IGif) => void;
}[] = [
  { label: 'Copy link', Icon: FaLink, run: copyGifLink },
  { label: 'Embed', Icon: FaCode, run: copyEmbedCode },
  { label: 'Download', Icon: FaDownload, run: (gif) => void downloadGif(gif) },
  {
    label: 'Giphy',
    Icon: FaUpRightFromSquare,
    run: (gif) => window.open(gif.url, '_blank'),
  },
];

const formatDate = (raw: string): string | null => {
  if (!raw || raw.startsWith('0000')) return null;
  const date = new Date(raw.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const actionButtonClass = cn(
  'flex items-center justify-start gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium',
  'transition-colors hover:bg-white/20',
);

/**
 * The Root stays mounted for the app's whole life — mounting it lazily with
 * `open` already true makes Base UI treat the dialog as initially-open and
 * skip the enter transition (the first-open-doesn't-animate bug).
 */
const GifDetailModal = ({ gif, onClose, onSelect }: Props) => {
  // Hold the last gif through the exit transition so the popup doesn't go
  // blank the instant the parent clears its selection.
  const lastGifRef = useRef<IGif | null>(null);
  if (gif) lastGifRef.current = gif;
  const shown = gif ?? lastGifRef.current;

  return (
    <Dialog.Root open={!!gif} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm',
            'transition-opacity duration-200',
            'data-starting-style:opacity-0 data-ending-style:opacity-0',
          )}
        />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(96vw,900px)] -translate-x-1/2 -translate-y-1/2',
            'flex-col overflow-y-auto rounded-2xl bg-[#101018] text-white shadow-2xl ring-1 ring-white/10',
            'transition-all duration-200 ease-out',
            'data-starting-style:scale-95 data-starting-style:opacity-0',
            'data-ending-style:scale-95 data-ending-style:opacity-0',
          )}
        >
          {shown && <ModalBody gif={shown} onSelect={onSelect} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/** Popup contents — mounts/unmounts with the popup, so related state resets
 * naturally between openings. */
const ModalBody = ({
  gif: shown,
  onSelect,
}: {
  gif: IGif;
  onSelect: (gif: IGif) => void;
}) => {
  const [related, setRelated] = useState<IGif[]>([]);
  const favorites = useFavorites();

  useEffect(() => {
    setRelated([]);
    const controller = new AbortController();
    fetchRelatedGifs(String(shown.id), controller.signal)
      .then((gifs) => setRelated(gifs.filter((entry) => entry.id !== shown.id)))
      .catch(() => undefined);
    return () => controller.abort();
  }, [shown]);

  const favorited = favorites.some((entry) => entry.id === shown.id);
  const displayName = gifDisplayName(shown);
  const profileUrl = gifProfileUrl(shown);
  const uploaded = formatDate(shown.import_datetime);
  const width = Number(shown.images.original?.width) || null;
  const height = Number(shown.images.original?.height) || null;

  return (
    <>
      <Dialog.Title className='sr-only'>{shown.title || 'GIF'}</Dialog.Title>
      <Dialog.Close
        className='absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-black/60 hover:text-white'
        aria-label='Close'
      >
        <FaXmark />
      </Dialog.Close>

      <div className='flex flex-col md:flex-row'>
        {/* media — aspect-ratio reserved from API dims, so swapping to a
                related gif never collapses the popup while the video loads */}
        <div
          className={cn(
            'grid flex-1 place-items-center bg-black/40',
            shown.is_sticker && 'sticker-bg',
          )}
        >
          <video
            key={String(shown.id)}
            src={fullVideoUrl(shown)}
            poster={shown.images.original_still?.url}
            style={
              width && height
                ? { aspectRatio: `${width} / ${height}` }
                : undefined
            }
            playsInline
            autoPlay
            muted
            loop
            className='max-h-[50dvh] w-full object-contain md:max-h-[92dvh]'
          />
        </div>

        {/* metadata + actions */}
        <div className='flex w-full shrink-0 flex-col gap-4 p-5 md:w-[320px]'>
          <div className='pr-8'>
            <h2 className='text-lg font-semibold leading-snug'>
              {shown.title || 'Untitled GIF'}
            </h2>
            <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50'>
              {width && height && (
                <span>
                  {width}×{height}
                </span>
              )}
              {uploaded && <span>Uploaded {uploaded}</span>}
              {shown.rating && (
                <span className='rounded border border-white/20 px-1.5 text-[10px] uppercase leading-4 text-white/70'>
                  {shown.rating}
                </span>
              )}
            </div>
          </div>

          {displayName && (
            <a
              href={profileUrl || undefined}
              target='_blank'
              rel='noreferrer'
              className={cn(
                'flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5',
                profileUrl && 'transition-colors hover:bg-white/10',
              )}
              onClick={(e) => !profileUrl && e.preventDefault()}
            >
              {shown.user?.avatar_url && (
                <img
                  src={shown.user.avatar_url}
                  alt=''
                  className='h-9 w-9 rounded-md'
                />
              )}
              <div className='min-w-0'>
                <div className='flex items-center gap-1 text-sm font-medium'>
                  <span className='truncate'>{displayName}</span>
                  {shown.user?.is_verified && (
                    <MdVerified className='shrink-0 text-cyan-400' />
                  )}
                </div>
                {shown.username && (
                  <div className='truncate text-xs text-white/50'>
                    @{shown.username}
                  </div>
                )}
              </div>
            </a>
          )}

          <div className='grid grid-cols-2 gap-2'>
            {GIF_ACTIONS.map(({ label, Icon, run }) => (
              <button
                key={label}
                className={actionButtonClass}
                onClick={() => run(shown)}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          <button
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              favorited
                ? 'bg-pink-600 text-white hover:bg-pink-700'
                : 'bg-white text-black hover:bg-white/80',
            )}
            onClick={() => toggleFavorite(shown)}
          >
            {favorited ? <FaHeart /> : <FaRegHeart />}
            {favorited ? 'Favorited' : 'Add to favorites'}
          </button>

          {related.length > 0 && (
            <div className='mt-auto'>
              <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-white/40'>
                More like this
              </div>
              <div className='flex gap-1.5 overflow-x-auto pb-1'>
                {related.map((entry) => (
                  <button
                    key={entry.id}
                    title={entry.title || undefined}
                    className='h-16 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 transition-transform hover:scale-105'
                    onClick={() => onSelect(entry)}
                  >
                    <img
                      src={thumbUrl(entry)}
                      alt={entry.title || ''}
                      loading='lazy'
                      className='h-full w-full object-cover'
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export { GifDetailModal };
