import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Github, Instagram, Mail, Layers } from 'lucide-react';
import { useRef, useEffect } from 'react';

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

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const offsetX1 = useTransform(smoothX, [0, 1], [-50, 50]);
  const offsetY1 = useTransform(smoothY, [0, 1], [-50, 50]);
  const offsetX2 = useTransform(smoothX, [0, 1], [-30, 30]);
  const offsetY2 = useTransform(smoothY, [0, 1], [-30, 30]);
  const offsetX3 = useTransform(smoothX, [0, 1], [-20, 20]);
  const offsetY3 = useTransform(smoothY, [0, 1], [-20, 20]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Floating layers in depth */}
      <motion.div
        style={{ 
          x: offsetX1,
          y: offsetY1,
          y: y1,
        }}
        className="absolute top-20 left-20 w-64 h-64 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10"
      />
      <motion.div
        style={{ 
          x: offsetX2,
          y: offsetY2,
          y: y2,
        }}
        className="absolute bottom-40 right-32 w-80 h-80 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10"
      />
      <motion.div
        style={{ 
          x: offsetX3,
          y: offsetY3,
          y: y3,
        }}
        className="absolute top-1/2 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10"
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, z: -100 }}
          animate={{ opacity: 1, z: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            style={{
              x: useTransform(smoothX, [0, 1], [-20, 20]),
              y: useTransform(smoothY, [0, 1], [-20, 20]),
            }}
            className="text-7xl md:text-9xl font-bold tracking-tight mb-8 text-white"
          >
            Scott
            <br />
            Hetrick
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4 mb-12"
        >
          <p className="text-2xl md:text-3xl text-slate-300">
            Tech Lead & Full Stack Engineer
          </p>
          <p className="text-lg md:text-xl text-slate-400">
            Creating depth in the digital space
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-6"
        >
          {[
            { Icon: Github, href: 'https://github.com/dreadhalor' },
            { Icon: Instagram, href: 'https://instagram.com/dreadhalor' },
            { Icon: Mail, href: 'mailto:hello@scottjhetrick.com' },
          ].map(({ Icon, href }, i) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, z: 20 }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <Icon size={24} />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const cards = [
  {
    title: 'Component Architecture',
    desc: 'Built reusable systems used by multiple teams',
    icon: Layers,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Full Stack Leadership',
    desc: 'Led technical decisions across the entire stack',
    icon: Layers,
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Performance Optimization',
    desc: 'Scaled applications to handle thousands of requests',
    icon: Layers,
    gradient: 'from-pink-500 to-orange-600',
  },
];

function FloatingCards() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-200px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-5xl md:text-7xl font-bold mb-24 text-white"
        >
          Expertise in Depth
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50, rotateX: -20 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              whileHover={{ 
                y: -20, 
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: 1000,
              }}
              className="relative group"
            >
              <div className={`p-8 rounded-3xl bg-gradient-to-br ${card.gradient} backdrop-blur-sm border border-white/10 h-full`}>
                <card.icon className="w-12 h-12 mb-6 text-white/90" />
                <h3 className="text-2xl font-bold mb-4 text-white">{card.title}</h3>
                <p className="text-white/80">{card.desc}</p>
              </div>

              {/* Shadow layer */}
              <div 
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${card.gradient} blur-xl opacity-0 group-hover:opacity-30 transition-opacity -z-10`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Journey() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div style={{ y }}>
          <h2 className="text-5xl md:text-7xl font-bold mb-12 text-white">
            The Journey
          </h2>

          <div className="space-y-8 text-lg text-slate-300 leading-relaxed">
            <p>
              Started in high school, building tools to automate Model UN conferences.
              That first taste of solving real problems with code set the trajectory.
            </p>
            <p>
              Since then, I've led teams, architected component libraries, scaled systems
              to thousands of users, and never stopped learning.
            </p>
            <p>
              When I'm not coding, you'll find me perfecting my pizza dough recipe,
              workshopping comedy sets, or exploring the latest in web technology.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10"
      >
        <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">
          Let's Connect
        </h2>
        
        <motion.a
          href="mailto:hello@scottjhetrick.com"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block text-xl px-8 py-4 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
        >
          hello@scottjhetrick.com
        </motion.a>

        <p className="mt-8 text-slate-400">
          🍕 Pizza connoisseur • 💻 Code craftsman • 🎤 Comedy dabbler
        </p>
      </motion.div>
    </section>
  );
}

export function SpatialDesign() {
  return (
    <>
      <Hero />
      <FloatingCards />
      <Journey />
      <Contact />
    </>
  );
}
