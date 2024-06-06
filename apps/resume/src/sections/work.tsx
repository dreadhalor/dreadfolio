import { Badge } from '@dread-ui/index';
import { cn } from '@repo/utils';
import { FaBriefcase } from 'react-icons/fa';
import { MdOutlineArrowOutward } from 'react-icons/md';

// const ExperienceCard = ({
//   title,
//   company,
//   date,
//   description,
//   technologies = [],
//   link,
// }: {
//   title: string;
//   company: string;
//   date: string;
//   description: string;
//   technologies?: string[];
//   link?: string;
// }) => (
//   <a
//     className={cn(
//       'group grid min-h-[50px] w-full grid-cols-4 flex-nowrap gap-4 rounded-lg p-4 transition-all',
//       'group-hover/list:opacity-50',
//       'hover:cursor-pointer hover:bg-teal-800/20 hover:!opacity-100',
//     )}
//     href={link}
//     target='_blank'
//   >
//     <div className='col-span-1 text-xs font-semibold uppercase tracking-wide text-slate-400'>
//       {children}
//     </div>

//     <div className='col-span-3 flex flex-col gap-2'>
//       <h3 className='relative text-sm font-medium leading-tight group-hover:text-teal-300 group-focus-visible:text-teal-300'>
//         {firstWords}
//         <span className='inline-block'>
//           {lastWord}
//           <MdOutlineArrowOutward
//             className={cn(
//               'ml-1 inline-block shrink-0 transition-transform',
//               'group-hover:-translate-y-1 group-hover:translate-x-1',
//               'group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1',
//             )}
//           />
//         </span>
//       </h3>
//       <p className='text-start text-sm leading-normal'>
//         Managed team as UI Tech Lead to create a component library and design
//         system for the distributed BroadlumeX ecosystem. Managed CI/CD pipelines
//         and deployments for the Tatami monorepo.
//       </p>
//       <div className='mt-1 flex w-full flex-wrap gap-2'>
//         {badges.map((badge) => (
//           <Badge key={badge}>{badge}</Badge>
//         ))}
//       </div>
//     </div>
//   </a>
// );

export const Work = () => {
  return (
    <div className='flex flex-col'>
      <div className='flex gap-2'>
        <FaBriefcase className='h-8 w-8' />
        <h2 className='text-3xl font-bold uppercase'>Work</h2>
      </div>
    </div>
  );
};
