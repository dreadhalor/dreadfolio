import { Card } from '@resume/card';
import { BsStack } from 'react-icons/bs';
import {
  FaReact,
  FaAngular,
  FaNode,
  FaAws,
  FaDocker,
  FaConfluence,
  FaJira,
  FaFigma,
  FaBootstrap,
} from 'react-icons/fa';
import {
  SiRubyonrails,
  SiJquery,
  SiExpress,
  SiRedis,
  SiJest,
  SiCypress,
  SiApollographql,
  SiGraphql,
  SiDotnet,
  SiPostgresql,
  SiMongodb,
  SiStorybook,
  SiGooglecloud,
  SiCircleci,
} from 'react-icons/si';
import { MdHttp } from 'react-icons/md';

interface TechnologyItemProps {
  logo: React.FC<{ className: string }>;
  label: string;
}
const TechnologyItem = ({ logo: Logo, label }: TechnologyItemProps) => (
  <div className='flex flex-col items-center gap-1'>
    {Logo && <Logo className='h-8 w-8 shrink-0' />}
    <p className='text-center text-[13px]'>{label}</p>
  </div>
);

export const Technologies = () => {
  return (
    <div className='flex flex-1 flex-col gap-2'>
      <div className='flex items-center gap-2 text-2xl'>
        <BsStack />
        <h2 className='font-bold uppercase'>Technologies</h2>
      </div>
      <Card className='grid flex-1 grid-cols-4 gap-y-2'>
        <TechnologyItem logo={FaReact} label='React' />
        <TechnologyItem logo={FaAngular} label='Angular' />
        <TechnologyItem logo={FaNode} label='Node.js' />
        <TechnologyItem logo={SiExpress} label='Express.js' />
        <TechnologyItem logo={SiRubyonrails} label='Rails' />
        <TechnologyItem logo={SiDotnet} label='ASP.NET' />
        <TechnologyItem logo={SiJquery} label='jQuery' />
        <TechnologyItem logo={FaAws} label='AWS' />
        <TechnologyItem logo={SiGooglecloud} label='GCP' />
        <TechnologyItem logo={FaDocker} label='Docker' />
        <TechnologyItem logo={SiRedis} label='Redis' />
        <TechnologyItem logo={SiJest} label='Jest' />
        <TechnologyItem logo={SiCypress} label='Cypress' />
        <TechnologyItem logo={FaConfluence} label='Confluence' />
        <TechnologyItem logo={FaJira} label='Jira' />
        <TechnologyItem logo={SiPostgresql} label='PostgreSQL' />
        <TechnologyItem logo={SiMongodb} label='MongoDB' />
        <TechnologyItem logo={SiGraphql} label='GraphQL' />
        <TechnologyItem logo={SiApollographql} label='Apollo' />
        <TechnologyItem logo={FaFigma} label='Figma' />
        <TechnologyItem logo={FaBootstrap} label='Bootstrap' />
        <TechnologyItem logo={SiStorybook} label='Storybook' />
        <TechnologyItem logo={SiCircleci} label='CircleCI' />
        <TechnologyItem logo={MdHttp} label='REST APIs' />
      </Card>
    </div>
  );
};
