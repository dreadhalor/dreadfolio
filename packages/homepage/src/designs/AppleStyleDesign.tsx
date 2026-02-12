import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Github, Instagram, ExternalLink, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={heroRef} className="relative h-[120vh] overflow-hidden">
      {/* Background gradient that zooms */}
      <motion.div
        style={{ scale, opacity }}
        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
      />
      
      <div className="relative h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-7xl md:text-9xl font-bold tracking-tight mb-8 text-white"
          >
            Scott Hetrick
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="text-2xl md:text-4xl text-white/90 mb-4"
          >
            Engineering the future.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="text-xl md:text-2xl text-white/70 italic"
          >
            One line of code at a time.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function ValueProp() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="relative py-32 px-6 bg-white text-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div style={{ y }} className="grid md:grid-cols-3 gap-12">
          {[
            { title: 'Innovation', desc: 'Pushing boundaries with cutting-edge technology' },
            { title: 'Craftsmanship', desc: 'Every detail matters in creating exceptional experiences' },
            { title: 'Impact', desc: 'Building products that change how people work and play' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-3xl font-semibold mb-4">{item.title}</h3>
              <p className="text-lg text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Showcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-200px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-5xl md:text-7xl font-bold text-center mb-24 text-white"
        >
          Featured Work
        </motion.h2>

        <div className="space-y-32">
          {[
            { name: 'HermitCraft Horns', stat: '5,000+ daily users', color: 'from-green-500 to-emerald-600' },
            { name: 'Component Library', stat: 'Used by 4 teams', color: 'from-blue-500 to-cyan-600' },
            { name: 'Analytics Platform', stat: 'Processing millions of events', color: 'from-purple-500 to-pink-600' },
          ].map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: '-100px' }}
              className={`relative h-96 rounded-3xl bg-gradient-to-br ${project.color} flex items-center justify-center overflow-hidden`}
            >
              <div className="text-center text-white p-8">
                <h3 className="text-4xl md:text-6xl font-bold mb-4">{project.name}</h3>
                <p className="text-xl md:text-2xl opacity-90">{project.stat}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-32 px-6 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-5xl md:text-7xl font-bold mb-8"
        >
          Let's create something amazing.
        </motion.h2>
        
        <motion.a
          href="mailto:hello@scottjhetrick.com"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 text-2xl text-blue-600 hover:text-blue-700 transition-colors group"
        >
          Get in touch
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
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
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Icon size={28} />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function AppleStyleDesign() {
  return (
    <>
      <Hero />
      <ValueProp />
      <Showcase />
      <Contact />
    </>
  );
}
