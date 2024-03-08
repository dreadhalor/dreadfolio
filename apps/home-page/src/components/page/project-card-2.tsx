import { ShareMeScreenshot } from '@repo/assets';
import { cn } from '@repo/utils';
import { MdOutlineArrowOutward } from 'react-icons/md';

const ProjectCard2 = () => {
  return (
    <div className='group relative grid gap-4 px-2 py-3 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50'>
      <div className='absolute inset-0 z-0 rounded-md transition group-hover:bg-slate-800/50 group-hover:drop-shadow-lg lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)]'></div>
      <div className='z-10 sm:order-2 sm:col-span-6'>
        <h3>
          <a
            className='group/link inline-flex items-baseline text-base font-medium leading-tight text-slate-200  hover:text-teal-300 focus-visible:text-teal-300'
            href='https://scottjhetrick.com/shareme'
            target='_blank'
            rel='noreferrer noopener'
            aria-label='Spotify Profile (opens in a new tab)'
          >
            <span className='absolute inset-0 rounded'></span>
            <span>
              <span className='flex flex-nowrap'>
                ShareMe
                <MdOutlineArrowOutward
                  className={cn(
                    'ml-1 transition-transform',
                    'group-hover/link:-translate-y-1 group-hover/link:translate-x-1',
                    'group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1',
                  )}
                />
              </span>
            </span>
          </a>
        </h3>
        <p className='mt-2 text-sm leading-normal'>
          Web app for visualizing personalized Spotify data. View your top
          artists, top tracks, recently played tracks, and detailed audio
          information about each track. Create and save new playlists of
          recommended tracks based on your existing playlists and more.
        </p>
        <ul className='mt-2 flex flex-wrap' aria-label='Technologies used:'>
          <li className='mr-1.5 mt-2'>
            <div className='flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 '>
              React
            </div>
          </li>
          <li className='mr-1.5 mt-2'>
            <div className='flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 '>
              Express
            </div>
          </li>
          <li className='mr-1.5 mt-2'>
            <div className='flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 '>
              Spotify API
            </div>
          </li>
          <li className='mr-1.5 mt-2'>
            <div className='flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 '>
              Heroku
            </div>
          </li>
        </ul>
      </div>
      <img
        alt='Shareme screenshot'
        loading='lazy'
        width='200'
        height='48'
        decoding='async'
        data-nimg='1'
        className='rounded border-2 border-slate-200/10 transition group-hover:border-slate-200/30 sm:order-1 sm:col-span-2 sm:translate-y-1'
        style={{ color: 'transparent' }}
        src={ShareMeScreenshot}
      />
    </div>
  );
};

export { ProjectCard2 };
