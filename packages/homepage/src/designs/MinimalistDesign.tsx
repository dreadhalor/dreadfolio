import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Github, Instagram, ExternalLink } from 'lucide-react';
import { useRef } from 'react';

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center px-6"
    >
      <motion.div
        style={{ y }}
        className="max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6 text-white">
            Scott Hetrick
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-2 font-light">
            Tech Lead. Full Stack Engineer.
          </p>
          
          <p className="text-lg md:text-xl text-slate-500 mb-12 font-light italic">
            Pizza. Programming. Punchlines.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex gap-6 mb-16"
        >
          {[
            { Icon: Github, href: 'https://github.com/dreadhalor', label: 'GitHub' },
            { Icon: Instagram, href: 'https://instagram.com/dreadhalor', label: 'Instagram' },
          ].map(({ Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Icon size={24} strokeWidth={1.5} />
            </motion.a>
          ))}
        </motion.div>

        <motion.a
          href="mailto:hello@scottjhetrick.com"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ x: 4 }}
          className="inline-block text-slate-400 hover:text-white transition-colors border-b border-slate-700 hover:border-slate-500 pb-1"
        >
          hello@scottjhetrick.com
        </motion.a>
      </motion.div>
    </motion.section>
  );
}

function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-12 text-white">
            About
          </h2>

          <div className="space-y-6 text-lg text-slate-400 leading-relaxed font-light">
            <p>
              My web development journey started in high school, automating Model United Nations conferences with my first software project. This early success propelled me into a career where I've since built a widely used component library, led UI projects, and embraced the challenges of full-stack development.
            </p>
            <p>
              Now, I specialize in creating elegant web experiences using TypeScript, React, and Tailwind CSS, finding joy in the sweet spot where design meets robust engineering. When I'm not coding, I'm likely eating pizza, doing stand-up comedy, or exploring new tech with friends and family.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const experience = [
  {
    title: 'Tech Lead',
    company: 'Broadlume',
    date: '2022 - 2024',
    description:
      'Managed team as Tech Lead to create a custom analytics service, component library + design system & unified portal with integrations for the distributed BroadlumeX ecosystem.',
    link: 'https://www.broadlume.com/',
    technologies: ['React', 'TypeScript', 'Docker', 'Redis', 'PostgreSQL', 'GraphQL', 'Ruby on Rails'],
  },
  {
    title: 'Senior Full Stack Engineer',
    company: 'Stash',
    date: '2021 - 2022',
    description:
      'Collaborated with graphic designers to implement new routes and features on the Stash website, enhancing user experience and site navigation.',
    link: 'https://www.stash.com/',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    title: 'Software Engineer II',
    company: 'Ultra Mobile',
    date: '2019 - 2020',
    description: `Developed software solutions to interface with T-Mobile's network, ensuring seamless integration and optimal performance.`,
    link: 'https://www.ultramobile.com/',
    technologies: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'AWS'],
  },
  {
    title: 'Software Developer',
    company: 'West End Designs',
    date: '2015 - 2020',
    description:
      'Provided client consulting, developing custom WordPress websites. Implemented responsive designs & optimized site performance.',
    link: 'https://www.westendwebdesigns.com/',
    technologies: ['WordPress', 'PHP', 'JavaScript', 'MySQL'],
  },
];

function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-light tracking-tight mb-16 text-white"
        >
          Experience
        </motion.h2>

        <div className="space-y-12">
          {experience.map((exp, index) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="border-l-2 border-slate-800 pl-6 hover:border-slate-600 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h3 className="text-2xl font-normal text-white">{exp.title}</h3>
                  <span className="text-sm text-slate-500 font-light">{exp.date}</span>
                </div>
                
                <a
                  href={exp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors mb-3"
                >
                  <span className="font-light">{exp.company}</span>
                  <ExternalLink size={14} strokeWidth={1.5} />
                </a>

                <p className="text-slate-400 mb-4 leading-relaxed font-light">{exp.description}</p>

                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs text-slate-500 border border-slate-800 rounded font-light"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const projects = [
  {
    id: 'hermitcraft-horns',
    title: 'HermitCraft Horns',
    description: 'An app for making & sharing audio clips of Hermitcraft videos. Built for scale, receiving 5,000 requests per day.',
    link: '/hermitcraft-horns',
    technologies: ['Next.js', 'PostgreSQL', 'Redis', 'AWS'],
  },
  {
    id: 'shareme',
    title: 'ShareMe',
    description: 'A Pinterest-inspired social media platform for sharing and discovering images.',
    link: '/shareme',
    technologies: ['React', 'Sanity.io', 'Firebase'],
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Classic Minesweeper game with customizable grid size and mine count.',
    link: '/minesweeper',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'pathfinder-visualizer',
    title: 'Pathfinding Visualizer',
    description: "Visualize pathfinding algorithms like Dijkstra's, BFS and A* on a grid.",
    link: '/pathfinder-visualizer',
    technologies: ['React', 'TypeScript'],
  },
  {
    id: 'fallcrate',
    title: 'Fallcrate',
    description: 'A Dropbox-inspired cloud storage app.',
    link: '/fallcrate',
    technologies: ['React', 'TypeScript', 'Firebase'],
  },
  {
    id: 'su-done-ku',
    title: 'Su-Done-Ku',
    description: 'A Sudoku solver with step-by-step visualization.',
    link: '/su-done-ku',
    technologies: ['React', 'TypeScript', 'AWS Lambda'],
  },
];

function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-light tracking-tight mb-16 text-white"
        >
          Projects
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.link}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group block"
            >
              <div className="p-6 border border-slate-800 rounded-lg hover:border-slate-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-normal text-white group-hover:text-slate-300 transition-colors">
                    {project.title}
                  </h3>
                  <ExternalLink 
                    className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" 
                    size={18} 
                    strokeWidth={1.5}
                  />
                </div>

                <p className="text-slate-400 mb-4 leading-relaxed font-light text-sm">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs text-slate-500 border border-slate-800 rounded font-light"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-center text-slate-500 text-sm font-light"
        >
          Click any project to explore it in the gallery
        </motion.p>
      </div>
    </section>
  );
}

function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <footer ref={ref} className="relative py-20 px-6 border-t border-slate-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <p className="text-slate-500 text-sm font-light">
            © 2026 Scott Hetrick
          </p>

          <div className="flex gap-6">
            {[
              { Icon: Github, href: 'https://github.com/dreadhalor', label: 'GitHub' },
              { Icon: Instagram, href: 'https://instagram.com/dreadhalor', label: 'Instagram' },
            ].map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                className="text-slate-600 hover:text-white transition-colors"
              >
                <Icon size={20} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Easter egg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.2 } : {}}
          transition={{ duration: 2, delay: 1 }}
          whileHover={{ opacity: 0.6 }}
          className="mt-12 text-center text-xs text-slate-700 hover:text-slate-500 transition-colors cursor-default font-light"
        >
          🍕 I've eaten pizza in 47 different countries
        </motion.div>
      </div>
    </footer>
  );
}

export function MinimalistDesign() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Footer />
    </>
  );
}
