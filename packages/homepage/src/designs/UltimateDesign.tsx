import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Github, Instagram, Mail, ExternalLink, Code2, Zap, Users, TrendingUp, Award, Terminal } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { NeonTextHero } from '../components/NeonTextHero';

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const offsetX = useTransform(smoothX, [0, 1], [-30, 30]);
  const offsetY = useTransform(smoothY, [0, 1], [-30, 30]);
  const offsetX2 = useTransform(smoothX, [0, 1], [-15, 15]);
  const offsetY2 = useTransform(smoothY, [0, 1], [-15, 15]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      {/* Floating decorative elements */}
      <motion.div
        style={{ x: offsetX, y: offsetY }}
        className="absolute top-40 left-20 w-64 h-64 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-3xl border border-white/5"
      />
      <motion.div
        style={{ x: offsetX2, y: offsetY2 }}
        className="absolute bottom-40 right-32 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-3xl border border-white/5"
      />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-6xl mx-auto w-full px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          {/* Simple neon text */}
          <NeonTextHero />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4"
        >
          <p className="text-2xl md:text-3xl text-slate-300 font-light">
            Tech Lead. Full Stack Engineer.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-400 mb-12 italic font-light"
        >
          Pizza. Programming. Punchlines.
        </motion.p>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4 mb-12"
        >
          {[
            { Icon: Github, href: 'https://github.com/dreadhalor', label: 'GitHub' },
            { Icon: Instagram, href: 'https://instagram.com/dreadhalor', label: 'Instagram' },
            { Icon: Mail, href: 'mailto:hello@scottjhetrick.com', label: 'Email' },
          ].map(({ Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon size={20} strokeWidth={1.5} />
            </motion.a>
          ))}
        </motion.div>

        {/* Tech stack badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'].map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 text-slate-300 font-light"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { icon: Users, label: 'Teams Led', value: '4+' },
    { icon: Code2, label: 'Years Experience', value: '9+' },
    { icon: TrendingUp, label: 'Daily Users', value: '5K+' },
  ];

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-6 mb-24"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" strokeWidth={1.5} />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 font-light">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* About content */}
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Building the future,
              <br />
              one component at a time
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 text-lg text-slate-400 leading-relaxed font-light"
          >
            <p>
              My web development journey started in high school, automating Model United Nations conferences with my first software project. This early success propelled me into a career where I've since built a widely used component library, led UI projects, and embraced the challenges of full-stack development.
            </p>
            <p>
              Now, I specialize in creating elegant web experiences using TypeScript, React, and Tailwind CSS, finding joy in the sweet spot where design meets robust engineering. When I'm not coding, I'm likely eating pizza, doing stand-up comedy, or exploring new tech with friends and family.
            </p>
          </motion.div>
        </div>
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
    highlight: 'Led 4-person team',
  },
  {
    title: 'Senior Full Stack Engineer',
    company: 'Stash',
    date: '2021 - 2022',
    description:
      'Collaborated with graphic designers to implement new routes and features on the Stash website, enhancing user experience and site navigation.',
    link: 'https://www.stash.com/',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'AWS'],
    highlight: 'Fintech at scale',
  },
  {
    title: 'Software Engineer II',
    company: 'Ultra Mobile',
    date: '2019 - 2020',
    description: `Developed software solutions to interface with T-Mobile's network, ensuring seamless integration and optimal performance.`,
    link: 'https://www.ultramobile.com/',
    technologies: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'AWS'],
    highlight: 'Telecom integration',
  },
  {
    title: 'Software Developer',
    company: 'West End Designs',
    date: '2015 - 2020',
    description:
      'Provided client consulting, developing custom WordPress websites. Implemented responsive designs & optimized site performance.',
    link: 'https://www.westendwebdesigns.com/',
    technologies: ['WordPress', 'PHP', 'JavaScript', 'MySQL'],
    highlight: 'Client consulting',
  },
];

function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={ref} className="relative py-32 px-6 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div style={{ y }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4 text-white"
          >
            Experience
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-400 mb-16 font-light"
          >
            9 years of building products people love
          </motion.p>

          <div className="space-y-6">
            {experience.map((exp, index) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="group relative"
              >
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-semibold text-white">{exp.title}</h3>
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {exp.highlight}
                        </span>
                      </div>
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-lg text-slate-300 hover:text-white transition-colors"
                      >
                        {exp.company}
                        <ExternalLink size={16} strokeWidth={1.5} />
                      </a>
                    </div>
                    <span className="text-slate-400 font-light whitespace-nowrap">{exp.date}</span>
                  </div>

                  <p className="text-slate-400 mb-4 leading-relaxed font-light">{exp.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-lg font-light"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
    featured: true,
    gradient: 'from-green-500/20 to-emerald-500/20',
    stat: '5K daily users',
  },
  {
    id: 'shareme',
    title: 'ShareMe',
    description: 'A Pinterest-inspired social media platform for sharing and discovering images.',
    link: '/shareme',
    technologies: ['React', 'Sanity.io', 'Firebase'],
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Classic Minesweeper game with customizable grid size and mine count.',
    link: '/minesweeper',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
  {
    id: 'pathfinder-visualizer',
    title: 'Pathfinding Visualizer',
    description: "Visualize pathfinding algorithms like Dijkstra's, BFS and A* on a grid.",
    link: '/pathfinder-visualizer',
    technologies: ['React', 'TypeScript'],
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'fallcrate',
    title: 'Fallcrate',
    description: 'A Dropbox-inspired cloud storage app.',
    link: '/fallcrate',
    technologies: ['React', 'TypeScript', 'Firebase'],
    gradient: 'from-purple-500/20 to-violet-500/20',
  },
  {
    id: 'su-done-ku',
    title: 'Su-Done-Ku',
    description: 'A Sudoku solver with step-by-step visualization.',
    link: '/su-done-ku',
    technologies: ['React', 'TypeScript', 'AWS Lambda'],
    gradient: 'from-indigo-500/20 to-blue-500/20',
  },
];

function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4 text-white"
        >
          Featured Projects
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-slate-400 mb-16 font-light"
        >
          Side projects and experiments
        </motion.p>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured project - spans 2 columns */}
          <motion.a
            href={projects[0].link}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 md:row-span-2 group block"
          >
            <div className={`h-full p-8 rounded-3xl bg-gradient-to-br ${projects[0].gradient} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all relative overflow-hidden`}>
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-6 h-6 text-green-400" strokeWidth={1.5} />
                      <span className="text-sm text-green-400 font-medium">Featured</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-slate-200 transition-colors">
                      {projects[0].title}
                    </h3>
                  </div>
                  <ExternalLink className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0" size={24} strokeWidth={1.5} />
                </div>

                <p className="text-lg text-slate-300 mb-6 leading-relaxed font-light max-w-2xl">
                  {projects[0].description}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="text-2xl font-bold text-white">{projects[0].stat}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {projects[0].technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 text-sm text-slate-300 bg-white/10 border border-white/20 rounded-lg font-light"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.a>

          {/* Other projects */}
          {projects.slice(1).map((project, index) => (
            <motion.a
              key={project.id}
              href={project.link}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              className="group block"
            >
              <div className={`h-full p-6 rounded-2xl bg-gradient-to-br ${project.gradient} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white group-hover:text-slate-200 transition-colors">
                    {project.title}
                  </h3>
                  <ExternalLink className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0" size={18} strokeWidth={1.5} />
                </div>

                <p className="text-sm text-slate-300 mb-4 leading-relaxed font-light">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs text-slate-400 bg-white/5 border border-white/10 rounded font-light"
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
    <footer ref={ref} className="relative py-32 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">
            Let's build something
            <br />
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundImage: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              className="inline-block"
            >
              extraordinary
            </motion.span>
          </h2>

          <motion.a
            href="mailto:hello@scottjhetrick.com"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block text-xl px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
          >
            hello@scottjhetrick.com
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/10"
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
                className="text-slate-500 hover:text-white transition-colors"
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

export function UltimateDesign() {
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
