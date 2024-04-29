import { cn } from '@repo/utils';
import { Section, SectionContent, SectionHeader } from './section/section';
import { Button, useIframe } from 'dread-ui';
import { experience, projects } from './info';
import { ExperienceCard, ProjectCard } from './list-card';
import { MdArrowDownward } from 'react-icons/md';

const PageContent = () => {
  const { sendMessageToParent } = useIframe();

  return (
    <div
      className={cn(
        'text-primary-foreground flex min-h-full flex-1 shrink-0 flex-col',
        'lg:pb-24',
      )}
    >
      <Section name='about' className='mb-4'>
        <SectionHeader>About Me</SectionHeader>
        <SectionContent className='flex flex-col gap-4 px-0'>
          <p>
            My web development journey started in high school, automating Model
            United Nations conferences with my first software project. This
            early success propelled me into a career where I've since built a
            widely used component library, led UI projects, & embraced the
            challenges of full-stack development with a mix of curiosity &
            humor.
          </p>
          <p>
            Now, I specialize in creating elegant web experiences using
            Typescript, React, & Tailwind CSS, finding joy in the sweet spot
            where design meets robust engineering. When I'm not coding, I'm
            likely eating pizza, doing stand-up comedy, eating pizza, exploring
            new tech, or enjoying life's simple moments with friends & family &
            pizza.
          </p>
        </SectionContent>
      </Section>
      <Section name='experience'>
        <SectionHeader>Experience</SectionHeader>
        <SectionContent className='group/list flex h-full min-w-0 shrink-0 flex-col items-center justify-center gap-2 px-0 text-white'>
          {experience.map((exp, i) => (
            <ExperienceCard key={i} {...exp} />
          ))}
        </SectionContent>
      </Section>
      <Section name='projects'>
        <SectionHeader>Projects</SectionHeader>
        <SectionContent className='group/list flex h-full min-w-0 shrink-0 flex-col items-center justify-center gap-2 px-0 text-white'>
          {projects.map((project, i) => (
            <ProjectCard key={i} {...project} />
          ))}
        </SectionContent>
        <Button
          variant='link'
          className='group mt-4 text-white'
          onClick={() =>
            sendMessageToParent({ type: 'command', payload: 'open-switcher' })
          }
        >
          View All Featured Projects
          <MdArrowDownward className='ml-2 inline-block transition-transform group-hover:translate-y-1' />
        </Button>
      </Section>
    </div>
  );
};

export { PageContent };
