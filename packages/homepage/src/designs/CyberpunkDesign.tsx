import { motion, useInView } from 'framer-motion';
import { Github, Instagram, Mail, ExternalLink, Zap, Code2, Award, Pizza, Star } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

function DogtownHero() {
  const [flickerStage, setFlickerStage] = useState(0);

  useEffect(() => {
    const flickerSequence = [
      { delay: 100, stage: 0 },
      { delay: 50, stage: 1 },
      { delay: 100, stage: 0 },
      { delay: 150, stage: 2 },
      { delay: 80, stage: 0 },
      { delay: 100, stage: 1 },
      { delay: 50, stage: 0 },
      { delay: 200, stage: 3 },
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

    setTimeout(() => runSequence(), 300);
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
    <section className="dogtown-hero">
      {/* Dense layered neon signs background */}
      <div className="neon-chaos">
        {/* Vertical signs */}
        <div className="sign-stack sign-stack-left">
          <div className="vert-sign vert-cyan">
            <div className="sign-text">開発</div>
            <div className="sign-glow" />
          </div>
          <div className="vert-sign vert-magenta">
            <div className="sign-text">Tech</div>
            <div className="sign-glow" />
          </div>
          <div className="vert-sign vert-yellow">
            <div className="sign-text">24/7</div>
            <div className="sign-glow" />
          </div>
        </div>

        <div className="sign-stack sign-stack-right">
          <div className="vert-sign vert-magenta">
            <div className="sign-text">コード</div>
            <div className="sign-glow" />
          </div>
          <div className="vert-sign vert-cyan">
            <div className="sign-text">CODE</div>
            <div className="sign-glow" />
          </div>
          <div className="vert-sign vert-yellow">
            <div className="sign-text">OPEN</div>
            <div className="sign-glow" />
          </div>
        </div>

        {/* Horizontal scattered signs */}
        <div className="scattered-sign scattered-1">
          <svg width="120" height="40" viewBox="0 0 120 40">
            <rect x="2" y="2" width="116" height="36" stroke="#ff0080" strokeWidth="2" fill="rgba(0,0,0,0.8)" rx="4" />
            <text x="60" y="26" textAnchor="middle" className="scattered-text">PIZZA→</text>
          </svg>
        </div>

        <div className="scattered-sign scattered-2">
          <svg width="100" height="40" viewBox="0 0 100 40">
            <rect x="2" y="2" width="96" height="36" stroke="#00d4ff" strokeWidth="2" fill="rgba(0,0,0,0.8)" rx="4" />
            <text x="50" y="26" textAnchor="middle" className="scattered-text-cyan">DEV BAR</text>
          </svg>
        </div>

        <div className="scattered-sign scattered-3">
          <svg width="80" height="60" viewBox="0 0 80 60">
            <circle cx="40" cy="30" r="25" stroke="#ffcc00" strokeWidth="3" fill="none" />
            <path d="M 25 30 L 40 30 L 33 20 M 40 30 L 33 40" stroke="#ffcc00" strokeWidth="3" fill="none" />
          </svg>
        </div>

        {/* Arrow chaos */}
        <div className="arrow-cluster">
          <svg width="60" height="60" className="cluster-arrow arrow-1">
            <path d="M 10 30 L 40 30 M 27 20 L 40 30 L 27 40" stroke="#ff0080" strokeWidth="3" fill="none" />
          </svg>
          <svg width="60" height="60" className="cluster-arrow arrow-2">
            <path d="M 50 30 L 20 30 M 33 20 L 20 30 L 33 40" stroke="#00d4ff" strokeWidth="3" fill="none" />
          </svg>
          <svg width="60" height="60" className="cluster-arrow arrow-3">
            <path d="M 30 10 L 30 40 M 20 27 L 30 40 L 40 27" stroke="#ffcc00" strokeWidth="3" fill="none" />
          </svg>
        </div>
      </div>

      {/* Atmospheric effects */}
      <div className="atmosphere-fog" />
      <div className="scan-lines" />
      <div className="vignette" />

      {/* Main content */}
      <div 
        className="hero-content"
        style={{
          opacity: getOpacity(),
          transition: flickerStage === 0 ? 'opacity 0.05s' : 'opacity 0.1s',
        }}
      >
        {/* Big neon name sign */}
        <div className="main-sign">
          <div className="sign-frame">
            <svg className="frame-deco frame-tl" width="40" height="40">
              <path d="M 5 35 L 5 5 L 35 5" stroke="#00d4ff" strokeWidth="3" fill="none" />
            </svg>
            <svg className="frame-deco frame-tr" width="40" height="40">
              <path d="M 5 5 L 35 5 L 35 35" stroke="#ff0080" strokeWidth="3" fill="none" />
            </svg>
            <svg className="frame-deco frame-bl" width="40" height="40">
              <path d="M 5 5 L 5 35 L 35 35" stroke="#ffcc00" strokeWidth="3" fill="none" />
            </svg>
            <svg className="frame-deco frame-br" width="40" height="40">
              <path d="M 35 5 L 35 35 L 5 35" stroke="#00d4ff" strokeWidth="3" fill="none" />
            </svg>
          </div>

          <div className="name-container">
            <h1 className="neon-name name-top">SCOTT</h1>
            <div className="name-divider">
              <div className="divider-dot" />
              <div className="divider-line" />
              <div className="divider-dot" />
            </div>
            <h1 className="neon-name name-bottom">HETRICK</h1>
          </div>

          {/* Subtitle panel */}
          <div className="subtitle-panel">
            <div className="panel-line panel-line-top" />
            <div className="subtitle-content">
              <span className="subtitle-tag">// TECH_LEAD</span>
              <span className="subtitle-dot">•</span>
              <span className="subtitle-tag">// FULL_STACK</span>
            </div>
            <div className="panel-line panel-line-bottom" />
          </div>
        </div>

        {/* Contact badges */}
        <div className="contact-badges">
          <a href="https://github.com/dreadhalor" target="_blank" rel="noopener noreferrer" className="neon-badge badge-cyan">
            <Github size={24} />
            <span>GITHUB</span>
          </a>
          <div className="badge-separator">
            <Pizza size={20} className="separator-icon" />
          </div>
          <a href="https://instagram.com/dreadhalor" target="_blank" rel="noopener noreferrer" className="neon-badge badge-magenta">
            <Instagram size={24} />
            <span>INSTAGRAM</span>
          </a>
          <div className="badge-separator">
            <Star size={20} className="separator-icon" />
          </div>
          <a href="mailto:hello@scottjhetrick.com" target="_blank" rel="noopener noreferrer" className="neon-badge badge-yellow">
            <Mail size={24} />
            <span>EMAIL</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        .dogtown-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #0a0a0a;
        }

        .neon-chaos {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .sign-stack {
          position: absolute;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sign-stack-left {
          top: 10%;
          left: 5%;
        }

        .sign-stack-right {
          top: 15%;
          right: 5%;
        }

        .vert-sign {
          position: relative;
          width: 80px;
          padding: 30px 20px;
          background: rgba(0, 0, 0, 0.9);
          border: 3px solid;
          border-radius: 12px;
          writing-mode: vertical-rl;
          text-orientation: upright;
          animation: sign-flicker 8s ease-in-out infinite;
        }

        .vert-cyan {
          border-color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          animation-delay: 0s;
        }

        .vert-magenta {
          border-color: #ff0080;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.3);
          animation-delay: 2s;
        }

        .vert-yellow {
          border-color: #ffcc00;
          box-shadow: 0 0 20px rgba(255, 204, 0, 0.3);
          animation-delay: 4s;
        }

        .sign-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: #fff;
          text-shadow: 
            0 0 10px currentColor,
            0 0 20px currentColor;
          position: relative;
          z-index: 2;
        }

        .vert-cyan .sign-text {
          color: #00d4ff;
        }

        .vert-magenta .sign-text {
          color: #ff0080;
        }

        .vert-yellow .sign-text {
          color: #ffcc00;
        }

        @keyframes sign-flicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
          75% { opacity: 0.6; }
        }

        .scattered-sign {
          position: absolute;
          animation: pulse-sign 4s ease-in-out infinite;
          opacity: 0.6;
        }

        .scattered-1 {
          top: 30%;
          left: 15%;
          animation-delay: 0.5s;
          filter: drop-shadow(0 0 15px #ff0080);
        }

        .scattered-2 {
          top: 60%;
          right: 12%;
          animation-delay: 1.5s;
          filter: drop-shadow(0 0 15px #00d4ff);
        }

        .scattered-3 {
          bottom: 15%;
          left: 20%;
          animation-delay: 2.5s;
          filter: drop-shadow(0 0 15px #ffcc00);
        }

        .scattered-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px;
          font-weight: 700;
          fill: #ff0080;
          filter: drop-shadow(0 0 5px #ff0080);
        }

        .scattered-text-cyan {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px;
          font-weight: 700;
          fill: #00d4ff;
          filter: drop-shadow(0 0 5px #00d4ff);
        }

        @keyframes pulse-sign {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.98); }
        }

        .arrow-cluster {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          opacity: 0.3;
        }

        .cluster-arrow {
          position: absolute;
          animation: rotate-arrow 20s linear infinite;
        }

        .arrow-1 {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          filter: drop-shadow(0 0 10px #ff0080);
        }

        .arrow-2 {
          bottom: 0;
          right: 0;
          filter: drop-shadow(0 0 10px #00d4ff);
          animation-delay: -7s;
        }

        .arrow-3 {
          bottom: 0;
          left: 0;
          filter: drop-shadow(0 0 10px #ffcc00);
          animation-delay: -14s;
        }

        @keyframes rotate-arrow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .atmosphere-fog {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 30% 30%, rgba(0, 212, 255, 0.15), transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(255, 0, 128, 0.15), transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(255, 204, 0, 0.1), transparent 60%);
          animation: fog-drift 15s ease-in-out infinite;
        }

        @keyframes fog-drift {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .scan-lines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 4px
          );
          pointer-events: none;
          z-index: 100;
        }

        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.8) 100%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
          padding: 40px;
        }

        .main-sign {
          position: relative;
          padding: 60px;
          background: rgba(0, 0, 0, 0.95);
          border: 4px solid #00d4ff;
          border-radius: 8px;
          box-shadow: 
            0 0 30px rgba(0, 212, 255, 0.4),
            inset 0 0 30px rgba(0, 212, 255, 0.1);
        }

        .sign-frame {
          position: absolute;
          inset: -20px;
          pointer-events: none;
        }

        .frame-deco {
          position: absolute;
          animation: frame-pulse 3s ease-in-out infinite;
        }

        .frame-tl {
          top: 0;
          left: 0;
          filter: drop-shadow(0 0 8px #00d4ff);
        }

        .frame-tr {
          top: 0;
          right: 0;
          filter: drop-shadow(0 0 8px #ff0080);
          animation-delay: 0.75s;
        }

        .frame-bl {
          bottom: 0;
          left: 0;
          filter: drop-shadow(0 0 8px #ffcc00);
          animation-delay: 1.5s;
        }

        .frame-br {
          bottom: 0;
          right: 0;
          filter: drop-shadow(0 0 8px #00d4ff);
          animation-delay: 2.25s;
        }

        @keyframes frame-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .name-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .neon-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 10vw, 8rem);
          font-weight: 900;
          letter-spacing: 0.2em;
          margin: 0;
          line-height: 1;
          -webkit-text-stroke-width: 3px;
          -webkit-text-fill-color: transparent;
          animation: neon-flicker 4s ease-in-out infinite;
        }

        .name-top {
          -webkit-text-stroke-color: #00d4ff;
          filter: 
            drop-shadow(0 0 15px #00d4ff)
            drop-shadow(0 0 30px #00d4ff)
            drop-shadow(0 0 45px #00d4ff);
        }

        .name-bottom {
          -webkit-text-stroke-color: #ff0080;
          filter: 
            drop-shadow(0 0 15px #ff0080)
            drop-shadow(0 0 30px #ff0080)
            drop-shadow(0 0 45px #ff0080);
          animation-delay: 2s;
        }

        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .name-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }

        .divider-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffcc00;
          box-shadow: 0 0 15px #ffcc00;
          animation: dot-pulse 2s ease-in-out infinite;
        }

        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .divider-line {
          flex: 1;
          height: 3px;
          background: linear-gradient(90deg, #00d4ff, #ffcc00, #ff0080);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .subtitle-panel {
          margin-top: 32px;
          padding: 20px 40px;
          background: rgba(0, 0, 0, 0.8);
          position: relative;
        }

        .panel-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00d4ff, transparent);
          box-shadow: 0 0 8px #00d4ff;
        }

        .panel-line-top {
          top: 0;
        }

        .panel-line-bottom {
          bottom: 0;
          background: linear-gradient(90deg, transparent, #ff0080, transparent);
          box-shadow: 0 0 8px #ff0080;
        }

        .subtitle-content {
          display: flex;
          align-items: center;
          gap: 16px;
          font-family: 'Courier New', monospace;
        }

        .subtitle-tag {
          color: #00d4ff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-shadow: 0 0 10px #00d4ff;
        }

        .subtitle-dot {
          color: #ffcc00;
          font-size: 20px;
          text-shadow: 0 0 10px #ffcc00;
        }

        .contact-badges {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .neon-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 28px;
          background: rgba(0, 0, 0, 0.9);
          border: 3px solid;
          border-radius: 8px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.2em;
          transition: all 0.3s;
        }

        .badge-cyan {
          border-color: #00d4ff;
          color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }

        .badge-cyan:hover {
          transform: translateY(-8px);
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
          background: rgba(0, 212, 255, 0.1);
        }

        .badge-magenta {
          border-color: #ff0080;
          color: #ff0080;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.3);
        }

        .badge-magenta:hover {
          transform: translateY(-8px);
          box-shadow: 0 0 30px rgba(255, 0, 128, 0.6);
          background: rgba(255, 0, 128, 0.1);
        }

        .badge-yellow {
          border-color: #ffcc00;
          color: #ffcc00;
          box-shadow: 0 0 20px rgba(255, 204, 0, 0.3);
        }

        .badge-yellow:hover {
          transform: translateY(-8px);
          box-shadow: 0 0 30px rgba(255, 204, 0, 0.6);
          background: rgba(255, 204, 0, 0.1);
        }

        .badge-separator {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.4;
        }

        .separator-icon {
          color: #ffcc00;
          filter: drop-shadow(0 0 10px #ffcc00);
          animation: rotate-pizza 20s linear infinite;
        }

        @keyframes rotate-pizza {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .sign-stack {
            display: none;
          }
          
          .scattered-sign {
            transform: scale(0.7);
          }
          
          .main-sign {
            padding: 40px 24px;
          }
          
          .neon-name {
            font-size: clamp(3rem, 12vw, 5rem);
          }
        }
      `}</style>
    </section>
  );
}

const experience = [
  {
    company: 'Broadlume',
    role: 'Tech Lead',
    years: '2022-2024',
    desc: 'Led team creating custom analytics + component library for BroadlumeX ecosystem',
    link: 'https://www.broadlume.com/',
    icon: Zap,
    color: 'cyan',
  },
  {
    company: 'Stash',
    role: 'Senior Full Stack Engineer',
    years: '2021-2022',
    desc: 'Enhanced Stash website with new features + improved UX',
    link: 'https://www.stash.com/',
    icon: Code2,
    color: 'magenta',
  },
  {
    company: 'Ultra Mobile',
    role: 'Software Engineer II',
    years: '2019-2020',
    desc: 'Built solutions interfacing with T-Mobile network',
    link: 'https://www.ultramobile.com/',
    icon: Award,
    color: 'yellow',
  },
];

function ExperienceSign({ exp, index }: { exp: typeof experience[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [flickerStage, setFlickerStage] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const flickerSequence = [
      { delay: 100, stage: 0 },
      { delay: 50, stage: 1 },
      { delay: 100, stage: 0 },
      { delay: 150, stage: 2 },
      { delay: 80, stage: 0 },
      { delay: 100, stage: 1 },
      { delay: 50, stage: 0 },
      { delay: 200, stage: 3 },
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

    setTimeout(() => runSequence(), index * 200);
  }, [isInView, index]);

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
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotateX: -15 }}
      animate={isInView ? { opacity: 1, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`exp-sign exp-${exp.color}`}
      style={{
        opacity: getOpacity(),
        transition: flickerStage === 0 ? 'opacity 0.05s' : 'opacity 0.1s',
      }}
    >
      <div className="sign-border-glow" />
      
      <div className="sign-header">
        <div className="company-badge">
          <exp.icon size={28} />
          <span className="company-name">{exp.company}</span>
        </div>
        <span className="years-tag">{exp.years}</span>
      </div>

      <h3 className="role-title">{exp.role}</h3>
      
      <p className="role-desc">{exp.desc}</p>

      <a href={exp.link} target="_blank" rel="noopener noreferrer" className="visit-link">
        VISIT_SITE <ExternalLink size={16} />
      </a>

      <div className="corner-marks">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>

      <style jsx>{`
        .exp-sign {
          position: relative;
          padding: 32px;
          background: rgba(0, 0, 0, 0.95);
          border: 3px solid;
          border-radius: 8px;
          transition: all 0.4s;
          transform-style: preserve-3d;
        }

        .exp-cyan {
          border-color: #00d4ff;
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);
        }

        .exp-cyan:hover {
          transform: translateY(-12px) rotateX(5deg);
          box-shadow: 0 20px 40px rgba(0, 212, 255, 0.4);
        }

        .exp-magenta {
          border-color: #ff0080;
          box-shadow: 0 0 25px rgba(255, 0, 128, 0.3);
        }

        .exp-magenta:hover {
          transform: translateY(-12px) rotateX(5deg);
          box-shadow: 0 20px 40px rgba(255, 0, 128, 0.4);
        }

        .exp-yellow {
          border-color: #ffcc00;
          box-shadow: 0 0 25px rgba(255, 204, 0, 0.3);
        }

        .exp-yellow:hover {
          transform: translateY(-12px) rotateX(5deg);
          box-shadow: 0 20px 40px rgba(255, 204, 0, 0.4);
        }

        .sign-border-glow {
          position: absolute;
          inset: -4px;
          border-radius: 8px;
          background: inherit;
          filter: blur(10px);
          opacity: 0.3;
          z-index: -1;
        }

        .sign-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .company-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .exp-cyan .company-badge {
          color: #00d4ff;
          filter: drop-shadow(0 0 8px #00d4ff);
        }

        .exp-magenta .company-badge {
          color: #ff0080;
          filter: drop-shadow(0 0 8px #ff0080);
        }

        .exp-yellow .company-badge {
          color: #ffcc00;
          filter: drop-shadow(0 0 8px #ffcc00);
        }

        .company-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          letter-spacing: 0.1em;
        }

        .years-tag {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          padding: 4px 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .role-title {
          font-family: 'Teko', sans-serif;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin: 0 0 16px 0;
          -webkit-text-stroke-width: 1px;
          -webkit-text-fill-color: transparent;
        }

        .exp-cyan .role-title {
          -webkit-text-stroke-color: #00d4ff;
          filter: drop-shadow(0 0 6px #00d4ff);
        }

        .exp-magenta .role-title {
          -webkit-text-stroke-color: #ff0080;
          filter: drop-shadow(0 0 6px #ff0080);
        }

        .exp-yellow .role-title {
          -webkit-text-stroke-color: #ffcc00;
          filter: drop-shadow(0 0 6px #ffcc00);
        }

        .role-desc {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .visit-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          letter-spacing: 0.15em;
          transition: all 0.3s;
        }

        .exp-cyan .visit-link {
          color: #00d4ff;
        }

        .exp-magenta .visit-link {
          color: #ff0080;
        }

        .exp-yellow .visit-link {
          color: #ffcc00;
        }

        .visit-link:hover {
          filter: brightness(1.5);
          transform: translateX(4px);
        }

        .corner-marks {
          position: absolute;
          inset: 8px;
          pointer-events: none;
        }

        .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.6;
        }

        .corner-tl {
          top: 0;
          left: 0;
          border-top: 2px solid;
          border-left: 2px solid;
        }

        .corner-tr {
          top: 0;
          right: 0;
          border-top: 2px solid;
          border-right: 2px solid;
        }

        .corner-bl {
          bottom: 0;
          left: 0;
          border-bottom: 2px solid;
          border-left: 2px solid;
        }

        .corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 2px solid;
          border-right: 2px solid;
        }

        .exp-cyan .corner {
          border-color: #00d4ff;
        }

        .exp-magenta .corner {
          border-color: #ff0080;
        }

        .exp-yellow .corner {
          border-color: #ffcc00;
        }
      `}</style>
    </motion.div>
  );
}

function DogtownExperience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="dogtown-section">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="section-header-sign"
        >
          <div className="header-border" />
          <h2 className="section-title">[ EXPERIENCE_LOG ]</h2>
          <div className="header-underline" />
        </motion.div>

        <div className="signs-grid">
          {experience.map((exp, i) => (
            <ExperienceSign key={exp.company} exp={exp} index={i} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .dogtown-section {
          position: relative;
          padding: 120px 24px;
          background: #0a0a0a;
          overflow: hidden;
        }

        .dogtown-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.05), transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(255, 0, 128, 0.05), transparent 40%);
        }

        .section-container {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header-sign {
          text-align: center;
          margin-bottom: 80px;
          position: relative;
        }

        .header-border {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 4px;
          background: linear-gradient(90deg, transparent, #00d4ff 20%, #ff0080 50%, #ffcc00 80%, transparent);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
        }

        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 900;
          letter-spacing: 0.15em;
          margin: 0;
          -webkit-text-stroke-width: 2px;
          -webkit-text-stroke-color: #00d4ff;
          -webkit-text-fill-color: transparent;
          filter: 
            drop-shadow(0 0 15px #00d4ff)
            drop-shadow(0 0 30px #00d4ff);
        }

        .header-underline {
          margin-top: 20px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ff0080 30%, #00d4ff 70%, transparent);
          box-shadow: 0 0 15px rgba(255, 0, 128, 0.6);
        }

        .signs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
          perspective: 1000px;
        }

        @media (max-width: 768px) {
          .signs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

const projects = [
  { name: 'Hermitcraft Horns', desc: '5K+ daily users', link: '/hermitcraft-horns', color: 'cyan' },
  { name: 'ShareMe', desc: 'Social platform', link: '/shareme', color: 'magenta' },
  { name: 'Minesweeper', desc: 'Classic game', link: '/minesweeper', color: 'yellow' },
  { name: 'Pathfinder', desc: 'Algorithm viz', link: '/pathfinder-visualizer', color: 'cyan' },
  { name: 'Fallcrate', desc: 'Cloud storage', link: '/fallcrate', color: 'magenta' },
  { name: 'Su-Done-Ku', desc: 'Sudoku solver', link: '/su-done-ku', color: 'yellow' },
];

function ProjectTile({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [flickerStage, setFlickerStage] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const flickerSequence = [
      { delay: 100, stage: 0 },
      { delay: 50, stage: 1 },
      { delay: 100, stage: 0 },
      { delay: 150, stage: 2 },
      { delay: 80, stage: 0 },
      { delay: 100, stage: 1 },
      { delay: 50, stage: 0 },
      { delay: 200, stage: 3 },
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

    setTimeout(() => runSequence(), index * 120);
  }, [isInView, index]);

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
    <motion.a
      ref={ref}
      href={project.link}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`project-tile tile-${project.color}`}
      style={{
        opacity: getOpacity(),
        transition: flickerStage === 0 ? 'opacity 0.05s' : 'opacity 0.1s',
      }}
    >
      <div className="tile-glow" />
      <div className="tile-number">{String(index + 1).padStart(2, '0')}</div>
      <h3 className="tile-title">{project.name}</h3>
      <p className="tile-desc">{project.desc}</p>
      <div className="tile-arrow">→</div>

      <style jsx>{`
        .project-tile {
          position: relative;
          padding: 32px;
          background: rgba(0, 0, 0, 0.95);
          border: 3px solid;
          border-radius: 12px;
          transition: all 0.4s;
          overflow: hidden;
          display: block;
        }

        .tile-cyan {
          border-color: #00d4ff;
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);
        }

        .tile-cyan:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 212, 255, 0.5);
        }

        .tile-magenta {
          border-color: #ff0080;
          box-shadow: 0 0 25px rgba(255, 0, 128, 0.3);
        }

        .tile-magenta:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 0, 128, 0.5);
        }

        .tile-yellow {
          border-color: #ffcc00;
          box-shadow: 0 0 25px rgba(255, 204, 0, 0.3);
        }

        .tile-yellow:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 204, 0, 0.5);
        }

        .tile-glow {
          position: absolute;
          inset: -10px;
          border-radius: 12px;
          background: inherit;
          filter: blur(20px);
          opacity: 0.2;
          z-index: -1;
        }

        .tile-number {
          position: absolute;
          top: 16px;
          right: 20px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          font-weight: 900;
          opacity: 0.15;
        }

        .tile-cyan .tile-number {
          color: #00d4ff;
        }

        .tile-magenta .tile-number {
          color: #ff0080;
        }

        .tile-yellow .tile-number {
          color: #ffcc00;
        }

        .tile-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin: 0 0 12px 0;
          -webkit-text-stroke-width: 0.8px;
          -webkit-text-fill-color: transparent;
        }

        .tile-cyan .tile-title {
          -webkit-text-stroke-color: #00d4ff;
          filter: drop-shadow(0 0 8px #00d4ff);
        }

        .tile-magenta .tile-title {
          -webkit-text-stroke-color: #ff0080;
          filter: drop-shadow(0 0 8px #ff0080);
        }

        .tile-yellow .tile-title {
          -webkit-text-stroke-color: #ffcc00;
          filter: drop-shadow(0 0 8px #ffcc00);
        }

        .tile-desc {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin: 0 0 20px 0;
        }

        .tile-arrow {
          font-size: 24px;
          transition: transform 0.3s;
        }

        .tile-cyan .tile-arrow {
          color: #00d4ff;
        }

        .tile-magenta .tile-arrow {
          color: #ff0080;
        }

        .tile-yellow .tile-arrow {
          color: #ffcc00;
        }

        .project-tile:hover .tile-arrow {
          transform: translateX(8px);
        }
      `}</style>
    </motion.a>
  );
}

function DogtownProjects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="dogtown-section">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="section-header-sign"
        >
          <div className="header-stars">
            <Star className="header-star" size={24} />
            <Star className="header-star" size={32} />
            <Star className="header-star" size={24} />
          </div>
          <h2 className="section-title">/ PROJECTS /</h2>
          <div className="header-underline" />
        </motion.div>

        <div className="projects-grid">
          {projects.map((project, i) => (
            <ProjectTile key={project.name} project={project} index={i} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .dogtown-section {
          position: relative;
          padding: 120px 24px;
          background: #0a0a0a;
        }

        .section-container {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header-sign {
          text-align: center;
          margin-bottom: 80px;
          position: relative;
        }

        .header-stars {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .header-star {
          color: #ff0080;
          filter: drop-shadow(0 0 10px #ff0080);
          animation: star-twinkle 3s ease-in-out infinite;
        }

        .header-star:nth-child(2) {
          animation-delay: 1s;
        }

        .header-star:nth-child(3) {
          animation-delay: 2s;
        }

        @keyframes star-twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 900;
          letter-spacing: 0.2em;
          margin: 0;
          -webkit-text-stroke-width: 2px;
          -webkit-text-stroke-color: #ff0080;
          -webkit-text-fill-color: transparent;
          filter: 
            drop-shadow(0 0 15px #ff0080)
            drop-shadow(0 0 30px #ff0080);
        }

        .header-underline {
          margin-top: 20px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ffcc00 20%, #00d4ff 50%, #ff0080 80%, transparent);
          box-shadow: 0 0 15px rgba(255, 204, 0, 0.6);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
        }

        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

function DogtownContact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="dogtown-contact">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        className="contact-mega-sign"
      >
        <div className="mega-border">
          <div className="border-corner border-tl" />
          <div className="border-corner border-tr" />
          <div className="border-corner border-bl" />
          <div className="border-corner border-br" />
        </div>

        <div className="mega-content">
          <div className="mega-label">[ CONNECTION_REQUEST ]</div>
          
          <h2 className="mega-title">LET'S TALK</h2>

          <a href="mailto:hello@scottjhetrick.com" className="mega-email">
            hello@scottjhetrick.com
          </a>

          <div className="social-row">
            <a href="https://github.com/dreadhalor" target="_blank" rel="noopener noreferrer" className="social-btn social-cyan">
              <Github size={24} />
            </a>
            <div className="social-divider">
              <Pizza size={20} className="divider-icon" />
            </div>
            <a href="https://instagram.com/dreadhalor" target="_blank" rel="noopener noreferrer" className="social-btn social-magenta">
              <Instagram size={24} />
            </a>
          </div>

          <div className="footer-text">
            © 2026 SCOTT HETRICK • 🍕 47 COUNTRIES
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .dogtown-contact {
          position: relative;
          padding: 120px 24px;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-mega-sign {
          position: relative;
          max-width: 800px;
          width: 100%;
          padding: 80px 60px;
          background: rgba(0, 0, 0, 0.95);
          border: 5px solid #ffcc00;
          border-radius: 16px;
          box-shadow: 
            0 0 40px rgba(255, 204, 0, 0.5),
            inset 0 0 40px rgba(255, 204, 0, 0.1);
        }

        .mega-border {
          position: absolute;
          inset: -30px;
          pointer-events: none;
        }

        .border-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 3px solid;
        }

        .border-tl {
          top: 0;
          left: 0;
          border-color: #00d4ff;
          border-right: none;
          border-bottom: none;
          filter: drop-shadow(0 0 10px #00d4ff);
        }

        .border-tr {
          top: 0;
          right: 0;
          border-color: #ff0080;
          border-left: none;
          border-bottom: none;
          filter: drop-shadow(0 0 10px #ff0080);
        }

        .border-bl {
          bottom: 0;
          left: 0;
          border-color: #ff0080;
          border-right: none;
          border-top: none;
          filter: drop-shadow(0 0 10px #ff0080);
        }

        .border-br {
          bottom: 0;
          right: 0;
          border-color: #00d4ff;
          border-left: none;
          border-top: none;
          filter: drop-shadow(0 0 10px #00d4ff);
        }

        .mega-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .mega-label {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          letter-spacing: 0.2em;
          color: #ffcc00;
          text-shadow: 0 0 10px #ffcc00;
        }

        .mega-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 8vw, 6rem);
          font-weight: 900;
          letter-spacing: 0.3em;
          margin: 0;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: #ffcc00;
          -webkit-text-fill-color: transparent;
          filter: 
            drop-shadow(0 0 20px #ffcc00)
            drop-shadow(0 0 40px #ffcc00)
            drop-shadow(0 0 60px #ffcc00);
          animation: title-pulse 3s ease-in-out infinite;
        }

        @keyframes title-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .mega-email {
          font-size: 24px;
          font-weight: 600;
          color: #00d4ff;
          padding: 20px 40px;
          background: rgba(0, 0, 0, 0.8);
          border: 3px solid #00d4ff;
          border-radius: 8px;
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.4);
          transition: all 0.3s;
        }

        .mega-email:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 40px rgba(0, 212, 255, 0.6);
          background: rgba(0, 212, 255, 0.1);
        }

        .social-row {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .social-btn {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid;
          border-radius: 50%;
          transition: all 0.3s;
        }

        .social-cyan {
          border-color: #00d4ff;
          color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        }

        .social-cyan:hover {
          transform: translateY(-8px) scale(1.1);
          box-shadow: 0 15px 40px rgba(0, 212, 255, 0.6);
        }

        .social-magenta {
          border-color: #ff0080;
          color: #ff0080;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.4);
        }

        .social-magenta:hover {
          transform: translateY(-8px) scale(1.1);
          box-shadow: 0 15px 40px rgba(255, 0, 128, 0.6);
        }

        .social-divider {
          color: #ffcc00;
          filter: drop-shadow(0 0 10px #ffcc00);
        }

        .divider-icon {
          animation: rotate-slow 30s linear infinite;
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .footer-text {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.1em;
          margin-top: 24px;
        }

        @media (max-width: 768px) {
          .contact-mega-sign {
            padding: 60px 32px;
          }
          
          .mega-email {
            font-size: 18px;
            padding: 16px 24px;
          }
        }
      `}</style>
    </section>
  );
}

export function CyberpunkDesign() {
  return (
    <>
      <DogtownHero />
      <DogtownExperience />
      <DogtownProjects />
      <DogtownContact />
    </>
  );
}
