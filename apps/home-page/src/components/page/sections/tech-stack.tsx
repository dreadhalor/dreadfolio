import { Card, CardContent, CardHeader } from 'dread-ui';

const TechStackSection = () => {
  return (
    <div className='flex min-h-full min-w-0 shrink-0 flex-col items-center justify-center gap-4 leading-[26px] text-slate-300'>
      <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
        <CardHeader>
          <h3>Front-End Technologies</h3>
        </CardHeader>
        <CardContent className='pl-10'>
          <ul className='list-disc'>
            <li>
              Programming Languages & Libraries: JavaScript, TypeScript,
              HTML/CSS, Sass
            </li>
            <li>
              Frameworks: React, Angular, Ruby on Rails (for front-end aspects),
              jQuery
            </li>
            <li>UI Development & Styling: TailwindCSS, Framer Motion</li>
            <li>Build Tools: Vite, Turborepo</li>
            <li>
              Design & Prototyping: Figma, Adobe Illustrator, Adobe Photoshop,
              Spline, p5.js
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
        <CardHeader>
          <h3>Back-End Technologies</h3>
        </CardHeader>
        <CardContent className='pl-10'>
          <ul className='list-disc'>
            <li>Programming Languages: Node.js, Java, Ruby, C/C++</li>
            <li>
              Frameworks & Runtime Environments: Express, Ruby on Rails
              (back-end aspects)
            </li>
            <li>
              API Development & Integration: GraphQL, RESTful Web APIs, tRPC
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
        <CardHeader>
          <h3>Databasing</h3>
        </CardHeader>
        <CardContent className='pl-10'>
          <ul className='list-disc'>
            <li>
              Types & Management Systems: RDBMS, PostgreSQL, MySQL, MongoDB,
              Firebase, PlanetScale
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
        <CardHeader>
          <h3>DevOps & Deployment</h3>
        </CardHeader>
        <CardContent className='pl-10'>
          <ul className='list-disc'>
            <li>Containerization & Orchestration: Docker</li>
            <li>Cloud Platforms & Services: AWS, DigitalOcean, Google Cloud</li>
            <li>
              Continuous Integration & Continuous Deployment (CI/CD): Github
              Actions, CircleCI
            </li>
            <li>Web Server Management: Nginx</li>
            <li>Visual Testing & Review: Chromatic</li>
          </ul>
        </CardContent>
      </Card>

      <Card className='bg-primary/30 overflow-hidden border-0 text-slate-300'>
        <CardHeader>
          <h3>Development Tooling & Collaboration</h3>
        </CardHeader>
        <CardContent className='pl-10'>
          <ul className='list-disc'>
            <li>Editors & IDEs: VSCode</li>
            <li>Version Control & Repository Hosting: Git, GitHub</li>
            <li>Package Managers: PNPM, NPM</li>
            <li>Testing Frameworks & Libraries: Vitest/Jest, Cypress</li>
            <li>Project Management & Documentation: Jira, Confluence</li>
            <li>
              Code Quality & Maintenance: Storybook, CodeClimate, Zod (for
              TypeScript validation)
            </li>
            <li>Scripting & Configuration: Bash, JSON, YML</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export { TechStackSection };
