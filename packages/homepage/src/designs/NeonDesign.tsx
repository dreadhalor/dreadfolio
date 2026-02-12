import { motion, useInView } from 'framer-motion';
import { Github, Instagram, Mail, ExternalLink } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

function NeonHero() {
  const [flickerStage, setFlickerStage] = useState(0);

  useEffect(() => {
    const flickerSequence = [
      { delay: 200, stage: 1 },
      { delay: 100, stage: 0 },
      { delay: 150, stage: 2 },
      { delay: 80, stage: 0 },
      { delay: 100, stage: 1 },
      { delay: 50, stage: 0 },
      { delay: 200, stage: 3 },
      { delay: 100, stage: 2 },
      { delay: 150, stage: 3 },
    ];

    let currentStep = 0;
    const runSequence = () => {
      if (currentStep < flickerSequence.length) {
        const step = flickerSequence[currentStep];
        setTimeout(() => {
          setFlickerStage(step.stage);
          currentStep++;
          runSequence();
        }, step.delay);
      }
    };

    setTimeout(() => runSequence(), 500);
  }, []);

  const getOpacity = () => {
    switch(flickerStage) {
      case 0: return 0;
      case 1: return 0.3;
      case 2: return 0.6;
      case 3: return 1;
      default: return 0;
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        {/* Main neon name */}
        <h1 
          className="neon-sign text-7xl md:text-9xl mb-12 tracking-wider"
          style={{
            opacity: getOpacity(),
            transition: flickerStage === 0 ? 'opacity 0.05s' : 'opacity 0.1s',
          }}
        >
          SCOTT HETRICK
        </h1>

        {/* Subtitle with different neon color */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <p className="neon-pink text-2xl md:text-3xl mb-4">
            TECH LEAD • FULL STACK ENGINEER
          </p>
          
          <p className="neon-yellow text-lg md:text-xl italic">
            Pizza. Programming. Punchlines.
          </p>
        </motion.div>

        {/* Neon-styled social links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.3 }}
          className="flex gap-6 justify-center mt-12"
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
              whileHover={{ scale: 1.1 }}
              className="neon-icon-box w-14 h-14 rounded-lg flex items-center justify-center"
            >
              <Icon size={24} strokeWidth={2} />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      <style jsx>{`
        .neon-sign {
          color: #fff;
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #fff,
            0 0 20px #00d4ff,
            0 0 30px #00d4ff,
            0 0 40px #00d4ff,
            0 0 55px #00d4ff,
            0 0 75px #00d4ff;
        }
        
        .neon-pink {
          color: #fff;
          font-weight: 600;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #ff006e,
            0 0 20px #ff006e,
            0 0 30px #ff006e,
            0 0 40px #ff006e;
        }
        
        .neon-yellow {
          color: #fff;
          font-weight: 400;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #ffbe0b,
            0 0 20px #ffbe0b,
            0 0 30px #ffbe0b;
        }
        
        .neon-icon-box {
          background: rgba(0, 212, 255, 0.05);
          border: 2px solid #00d4ff;
          color: #00d4ff;
          box-shadow:
            0 0 5px #00d4ff,
            0 0 10px #00d4ff,
            inset 0 0 10px rgba(0, 212, 255, 0.2);
          transition: all 0.3s;
        }
        
        .neon-icon-box:hover {
          background: rgba(0, 212, 255, 0.15);
          box-shadow:
            0 0 10px #00d4ff,
            0 0 20px #00d4ff,
            0 0 30px #00d4ff,
            inset 0 0 15px rgba(0, 212, 255, 0.3);
        }
      `}</style>
    </section>
  );
}

const experience = [
  {
    title: 'Tech Lead',
    company: 'Broadlume',
    date: '2022 - 2024',
    description: 'Led team to create custom analytics service, component library + design system for the distributed BroadlumeX ecosystem.',
    link: 'https://www.broadlume.com/',
  },
  {
    title: 'Senior Full Stack Engineer',
    company: 'Stash',
    date: '2021 - 2022',
    description: 'Implemented new features on the Stash website, enhancing user experience and site navigation.',
    link: 'https://www.stash.com/',
  },
  {
    title: 'Software Engineer II',
    company: 'Ultra Mobile',
    date: '2019 - 2020',
    description: `Developed software solutions to interface with T-Mobile's network.`,
    link: 'https://www.ultramobile.com/',
  },
  {
    title: 'Software Developer',
    company: 'West End Designs',
    date: '2015 - 2020',
    description: 'Provided client consulting, developing custom WordPress websites.',
    link: 'https://www.westendwebdesigns.com/',
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
          className="neon-pink-heading text-5xl md:text-6xl mb-16 text-center"
        >
          EXPERIENCE
        </motion.h2>

        <div className="space-y-8">
          {experience.map((exp, index) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="neon-card group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                <h3 className="text-2xl font-semibold text-cyan-300">{exp.title}</h3>
                <span className="text-sm text-pink-400">{exp.date}</span>
              </div>
              
              <a
                href={exp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lg text-cyan-300 hover:text-cyan-100 transition-colors mb-3"
              >
                {exp.company}
                <ExternalLink size={16} strokeWidth={2} />
              </a>

              <p className="text-slate-300 leading-relaxed">{exp.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .neon-pink-heading {
          color: #fff;
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #ff006e,
            0 0 20px #ff006e,
            0 0 30px #ff006e,
            0 0 40px #ff006e,
            0 0 55px #ff006e;
        }
        
        .neon-card {
          background: rgba(0, 212, 255, 0.02);
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 12px;
          padding: 24px;
          box-shadow:
            0 0 10px rgba(0, 212, 255, 0.2),
            inset 0 0 10px rgba(0, 212, 255, 0.05);
          transition: all 0.3s;
        }
        
        .neon-card:hover {
          border-color: rgba(0, 212, 255, 0.6);
          box-shadow:
            0 0 20px rgba(0, 212, 255, 0.4),
            inset 0 0 15px rgba(0, 212, 255, 0.1);
        }
      `}</style>
    </section>
  );
}

const projects = [
  {
    id: 'hermitcraft-horns',
    title: 'HermitCraft Horns',
    description: 'Audio clip app receiving 5,000+ daily requests',
    link: '/hermitcraft-horns',
    color: '#00d4ff',
  },
  {
    id: 'shareme',
    title: 'ShareMe',
    description: 'Pinterest-inspired social media platform',
    link: '/shareme',
    color: '#ff006e',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Classic game with customizable grid',
    link: '/minesweeper',
    color: '#ffbe0b',
  },
  {
    id: 'pathfinder-visualizer',
    title: 'Pathfinding Visualizer',
    description: "Visualize algorithms like Dijkstra's, BFS and A*",
    link: '/pathfinder-visualizer',
    color: '#00f5d4',
  },
  {
    id: 'fallcrate',
    title: 'Fallcrate',
    description: 'Dropbox-inspired cloud storage',
    link: '/fallcrate',
    color: '#9d4edd',
  },
  {
    id: 'su-done-ku',
    title: 'Su-Done-Ku',
    description: 'Sudoku solver with step-by-step visualization',
    link: '/su-done-ku',
    color: '#f72585',
  },
];

function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="neon-yellow-heading text-5xl md:text-6xl mb-16 text-center"
        >
          PROJECTS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.link}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="neon-project-card group block"
              style={{
                '--neon-color': project.color,
              } as React.CSSProperties}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold" style={{ color: project.color }}>
                  {project.title}
                </h3>
                <ExternalLink 
                  className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0" 
                  size={18} 
                  strokeWidth={2}
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {project.description}
              </p>
            </motion.a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .neon-yellow-heading {
          color: #fff;
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #ffbe0b,
            0 0 20px #ffbe0b,
            0 0 30px #ffbe0b,
            0 0 40px #ffbe0b,
            0 0 55px #ffbe0b;
        }
        
        .neon-project-card {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid;
          border-color: var(--neon-color);
          border-radius: 16px;
          padding: 24px;
          box-shadow:
            0 0 10px var(--neon-color),
            inset 0 0 10px rgba(255, 255, 255, 0.02);
          transition: all 0.3s;
          opacity: 0.7;
        }
        
        .neon-project-card:hover {
          opacity: 1;
          box-shadow:
            0 0 20px var(--neon-color),
            0 0 30px var(--neon-color),
            inset 0 0 15px rgba(255, 255, 255, 0.05);
          transform: translateY(-4px);
        }
      `}</style>
    </section>
  );
}

function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="neon-cyan-heading text-5xl md:text-7xl mb-12"
        >
          LET'S CONNECT
        </motion.h2>

        <motion.a
          href="mailto:hello@scottjhetrick.com"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="neon-button inline-block text-2xl px-12 py-6 rounded-full"
        >
          hello@scottjhetrick.com
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex gap-8 justify-center mt-12"
        >
          {[
            { Icon: Github, href: 'https://github.com/dreadhalor', label: 'GitHub' },
            { Icon: Instagram, href: 'https://instagram.com/dreadhalor', label: 'Instagram' },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Icon size={28} strokeWidth={2} />
            </a>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.4 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 text-slate-500 text-sm"
        >
          🍕 I've eaten pizza in 47 different countries
        </motion.p>
      </div>

      <style jsx>{`
        .neon-cyan-heading {
          color: #fff;
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #00d4ff,
            0 0 20px #00d4ff,
            0 0 30px #00d4ff,
            0 0 40px #00d4ff,
            0 0 55px #00d4ff;
        }
        
        .neon-button {
          background: rgba(0, 212, 255, 0.1);
          border: 3px solid #00d4ff;
          color: #fff;
          font-weight: 600;
          box-shadow:
            0 0 10px #00d4ff,
            0 0 20px #00d4ff,
            inset 0 0 10px rgba(0, 212, 255, 0.2);
          transition: all 0.3s;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #00d4ff;
        }
        
        .neon-button:hover {
          background: rgba(0, 212, 255, 0.2);
          box-shadow:
            0 0 20px #00d4ff,
            0 0 30px #00d4ff,
            0 0 40px #00d4ff,
            inset 0 0 15px rgba(0, 212, 255, 0.3);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}

export function NeonDesign() {
  return (
    <>
      <NeonHero />
      <Experience />
      <Projects />
      <Contact />
    </>
  );
}
