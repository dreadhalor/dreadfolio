import { cn } from '@repo/utils';
import { MdOutlineArrowOutward } from 'react-icons/md';
import { Badge } from 'dread-ui';

type ProjectCardProps = {
  title: string;
  description: string;
  technologies: string[];
  image: string;
};
const ProjectCard = ({
  title,
  description,
  technologies,
  image,
}: ProjectCardProps) => {
  return (
    <div className='group/projects flex min-h-[50px] w-full flex-nowrap gap-2 rounded-lg p-3 transition-colors hover:cursor-pointer hover:bg-slate-800/50'>
      <img
        src={image}
        alt={title}
        className='h-[100px] w-[100px] rounded-lg border-2'
      />
      <div className='flex flex-1 flex-col gap-2'>
        <h3 className='relative flex flex-nowrap'>
          {title}
          <MdOutlineArrowOutward
            className={cn(
              'ml-1 transition-transform',
              'group-hover/projects:-translate-y-1 group-hover/projects:translate-x-1',
              'group-focus-visible/projects:-translate-y-1 group-focus-visible/projects:translate-x-1',
            )}
          />
        </h3>
        <p className='text-sm leading-normal'>{description}</p>
        {/* <p className='text-sm leading-normal'>
          Web app for visualizing personalized Spotify data. View your top
          artists, top tracks, recently played tracks, and detailed audio
          information about each track. Create and save new playlists of
          recommended tracks based on your existing playlists and more.
        </p> */}
        <div className='flex w-full flex-wrap gap-2'>
          {technologies.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
          {/* <Badge>React</Badge>
          <Badge>Sanity.io</Badge>
          <Badge>Firebase</Badge> */}
        </div>
      </div>
    </div>
  );
};

const ProjectCardList = ({ projects }: { projects: ProjectCardProps[] }) => {
  return (
    <ul className='flex flex-col gap-4'>
      {projects.map((project, i) => (
        <ProjectCard key={i} {...project} />
      ))}
    </ul>
  );
};

export { ProjectCardList };
