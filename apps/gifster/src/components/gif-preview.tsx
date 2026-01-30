import { IGif } from '@giphy/js-types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useAchievements,
} from 'dread-ui';
import { cn } from '@repo/utils';
import { MdVerified } from 'react-icons/md';
import { FaClipboard, FaClipboardCheck } from 'react-icons/fa6';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const getImagePreview = (gif: IGif) => {
  return gif.images.original_mp4?.mp4 || gif.images.original?.mp4 || '';
};
const getDisplayName = (gif: IGif) => {
  return (
    gif?.user?.display_name ||
    gif?.username ||
    gif?.source_tld ||
    gif?.title ||
    ''
  );
};

const UserInfo = ({ gif }: { gif: IGif }) => {
  const { unlockAchievementById } = useAchievements();
  
  const avatar = gif.user?.avatar_url;
  const displayName = getDisplayName(gif);
  const isVerified = gif?.user?.is_verified;
  const profileUrl =
    (gif?.user as { profile_url?: string })?.profile_url || 
    gif?.user?.website_url || 
    gif.source;
  
  const handleProfileClick = (e: React.MouseEvent) => {
    if (!profileUrl) return;
    e.stopPropagation();
    unlockAchievementById('poster_profile', 'gifster');
    window.open(profileUrl, '_blank');
  };

  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-0 left-0 right-0 flex h-[60px]',
        'bg-gradient-to-b from-transparent to-black',
        'opacity-0 transition-all duration-200 group-hover:opacity-100',
      )}
    >
      <div className='mx-3 mb-3 mt-auto flex items-center text-xs text-white'>
        {avatar && (
          <img
            src={avatar}
            className='peer pointer-events-auto mr-2 h-8 w-8'
            onClick={handleProfileClick}
          />
        )}
        <span
          className={cn(
            'pointer-events-auto mr-1',
            profileUrl && 'hover:font-bold peer-hover:font-bold',
          )}
          onClick={handleProfileClick}
        >
          {displayName}
        </span>
        {isVerified && <MdVerified />}
      </div>
    </div>
  );
};

const ActionButtons = ({
  gif,
  linkCopiedSuccessfully,
  setLinkCopiedSuccessfully,
}: {
  gif: IGif;
  linkCopiedSuccessfully: boolean;
  setLinkCopiedSuccessfully: (linkCopiedSuccessfully: boolean) => void;
}) => {
  const copyToClipboard = (gifUrl: string) => {
    navigator.clipboard
      .writeText(gifUrl)
      .then(() => {
        setLinkCopiedSuccessfully(true);
      })
      .catch((err) => {
        console.error('Failed to copy GIF URL:', err);
        // Handle errors (e.g., clipboard permissions)
        setLinkCopiedSuccessfully(false);
      });
  };

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 flex justify-end',
        'opacity-0 transition-all duration-200 group-hover:opacity-100',
      )}
    >
      <div className='mx-3 mb-auto mt-3 flex items-center gap-1 text-white'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='pointer-events-auto text-base'
              onClick={(e) => {
                e.stopPropagation();
                window.open(gif.url, '_blank');
              }}
            >
              <FaExternalLinkAlt />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>Open in new tab</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='pointer-events-auto text-base'
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(gif.images.original.mp4);
              }}
            >
              {linkCopiedSuccessfully ? <FaClipboardCheck /> : <FaClipboard />}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>
            Copy direct url to clipboard
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

type Props = {
  gif: IGif;
};

const GifPreview = ({ gif }: Props) => {
  const [linkCopiedSuccessfully, setLinkCopiedSuccessfully] =
    useState<boolean>(false);
  const { unlockAchievementById } = useAchievements();

  useEffect(() => {
    if (linkCopiedSuccessfully)
      unlockAchievementById('copy_gif_url', 'gifster');
  }, [linkCopiedSuccessfully, unlockAchievementById]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) unlockAchievementById('open_gif', 'gifster');
        return open;
      }}
    >
      <DialogTrigger asChild>
        <div
          className='group relative mb-1 cursor-pointer overflow-hidden rounded-lg'
          onPointerLeave={() => setLinkCopiedSuccessfully(false)}
        >
          <video
            src={getImagePreview(gif)}
            playsInline
            autoPlay
            muted
            loop
            className='w-full'
          />
          <UserInfo gif={gif} />
          <ActionButtons
            gif={gif}
            linkCopiedSuccessfully={linkCopiedSuccessfully}
            setLinkCopiedSuccessfully={setLinkCopiedSuccessfully}
          />
        </div>
      </DialogTrigger>
      <DialogContent className='max-h-screen overflow-y-auto border-0 p-0'>
        <video
          src={gif.images.original.mp4}
          playsInline
          autoPlay
          muted
          loop
          className='w-full rounded-lg'
        />
      </DialogContent>
    </Dialog>
  );
};

export { GifPreview };
