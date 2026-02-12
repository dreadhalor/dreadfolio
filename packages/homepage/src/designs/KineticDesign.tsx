import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Github, Instagram, Zap } from 'lucide-react';
import { useRef, useEffect } from 'react';

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      {/* Animated background blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl opacity-30"
      />

      <motion.div
        style={{ rotateX, rotateY, perspective: 1000 }}
        className="max-w-6xl mx-auto text-center"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
          className="text-7xl md:text-9xl font-black mb-8 relative"
        >
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
              backgroundImage: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #f7b731, #ff6b6b)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            className="inline-block"
          >
            Scott
          </motion.span>
          <br />
          <motion.span
            animate={{
              backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundImage: 'linear-gradient(90deg, #f7b731, #45b7d1, #4ecdc4, #ff6b6b, #f7b731)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            className="inline-block"
          >
            Hetrick
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4"
        >
          {['Tech Lead', 'Full Stack Engineer', 'Creative Coder'].map((text, i) => (
            <motion.div
              key={text}
              animate={{ x: [0, 10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="inline-block mx-3"
            >
              <span className="text-xl md:text-3xl text-white font-bold px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                {text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-8 justify-center mt-16"
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
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="text-white hover:text-pink-400 transition-colors"
            >
              <Icon size={32} />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

const skills = [
  { name: 'React', level: 95, color: 'from-cyan-400 to-blue-500' },
  { name: 'TypeScript', level: 90, color: 'from-blue-500 to-indigo-500' },
  { name: 'Node.js', level: 85, color: 'from-green-400 to-emerald-500' },
  { name: 'PostgreSQL', level: 80, color: 'from-purple-400 to-pink-500' },
  { name: 'AWS', level: 75, color: 'from-orange-400 to-red-500' },
];

function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="text-5xl md:text-7xl font-black mb-20 text-white"
        >
          <Zap className="inline-block mr-4 text-yellow-400" size={60} />
          Superpowers
        </motion.h2>

        <div className="space-y-8">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -100 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-white">{skill.name}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  className="text-xl font-bold text-pink-400"
                >
                  {skill.level}%
                </motion.span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${skill.level}%` } : {}}
                  transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <motion.h2
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundImage: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #f7b731, #ff6b6b)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            className="text-6xl md:text-8xl font-black mb-12"
          >
            Let's Build Something Bold
          </motion.h2>

          <motion.a
            href="mailto:hello@scottjhetrick.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block text-2xl md:text-3xl font-bold px-12 py-6 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-2xl shadow-purple-500/50"
          >
            Get in Touch →
          </motion.a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.4 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-16 text-slate-500 text-sm"
        >
          🍕 Pizza enthusiast • 💻 Code perfectionist • 🎤 Amateur comedian
        </motion.p>
      </div>
    </section>
  );
}

export function KineticDesign() {
  return (
    <>
      <Hero />
      <Skills />
      <CTA />
    </>
  );
}
