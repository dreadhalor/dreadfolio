import { useEffect, useState } from 'react';

export function NeonTextHero() {
  const [flickerStage, setFlickerStage] = useState(0);

  useEffect(() => {
    // Authentic neon flicker sequence
    const flickerSequence = [
      { delay: 200, stage: 1 },   // First quick flash
      { delay: 100, stage: 0 },   // Off
      { delay: 150, stage: 2 },   // Partial glow
      { delay: 80, stage: 0 },    // Off
      { delay: 100, stage: 1 },   // Quick flash
      { delay: 50, stage: 0 },    // Off
      { delay: 200, stage: 3 },   // Almost full
      { delay: 100, stage: 2 },   // Flicker down
      { delay: 150, stage: 3 },   // Full on!
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
    <div className="relative w-screen left-[50%] -translate-x-1/2 h-48 md:h-64 flex items-center justify-center">
      <svg 
        viewBox="0 0 1200 200" 
        className="w-full max-w-5xl h-full"
        style={{
          opacity: getOpacity(),
          transition: flickerStage === 0 ? 'opacity 0.05s' : 'opacity 0.1s',
        }}
      >
        <defs>
          {/* Neon glow filters */}
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="outer-glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow layer */}
        <g filter="url(#outer-glow)" opacity="0.4">
          {/* S */}
          <path d="M 50 80 Q 50 50, 80 50 Q 110 50, 110 80 Q 110 100, 80 100 Q 50 100, 50 120 Q 50 150, 80 150 Q 110 150, 110 120" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* C */}
          <path d="M 180 50 Q 130 50, 130 100 Q 130 150, 180 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* O */}
          <path d="M 220 100 m 0 -50 a 30 50 0 1 0 0 100 a 30 50 0 1 0 0 -100" 
                stroke="#00d4ff" strokeWidth="8" fill="none"/>
          
          {/* T */}
          <path d="M 280 50 L 350 50 M 315 50 L 315 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* T */}
          <path d="M 380 50 L 450 50 M 415 50 L 415 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* H */}
          <path d="M 510 50 L 510 150 M 510 100 L 580 100 M 580 50 L 580 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* E */}
          <path d="M 640 50 L 710 50 M 640 50 L 640 150 M 640 100 L 700 100 M 640 150 L 710 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* T */}
          <path d="M 740 50 L 810 50 M 775 50 L 775 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* R */}
          <path d="M 840 50 L 840 150 M 840 50 L 910 50 Q 930 50, 930 75 Q 930 100, 910 100 L 840 100 M 870 100 L 920 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* I */}
          <path d="M 960 50 L 960 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* C */}
          <path d="M 1050 50 Q 1000 50, 1000 100 Q 1000 150, 1050 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
          
          {/* K */}
          <path d="M 1080 50 L 1080 150 M 1080 100 L 1150 50 M 1080 100 L 1150 150" 
                stroke="#00d4ff" strokeWidth="8" fill="none" strokeLinecap="round"/>
        </g>

        {/* Main neon layer */}
        <g filter="url(#neon-glow)">
          {/* S */}
          <path d="M 50 80 Q 50 50, 80 50 Q 110 50, 110 80 Q 110 100, 80 100 Q 50 100, 50 120 Q 50 150, 80 150 Q 110 150, 110 120" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* C */}
          <path d="M 180 50 Q 130 50, 130 100 Q 130 150, 180 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* O */}
          <path d="M 220 100 m 0 -50 a 30 50 0 1 0 0 100 a 30 50 0 1 0 0 -100" 
                stroke="#00eeff" strokeWidth="3" fill="none"/>
          
          {/* T */}
          <path d="M 280 50 L 350 50 M 315 50 L 315 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* T */}
          <path d="M 380 50 L 450 50 M 415 50 L 415 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* H */}
          <path d="M 510 50 L 510 150 M 510 100 L 580 100 M 580 50 L 580 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* E */}
          <path d="M 640 50 L 710 50 M 640 50 L 640 150 M 640 100 L 700 100 M 640 150 L 710 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* T */}
          <path d="M 740 50 L 810 50 M 775 50 L 775 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* R */}
          <path d="M 840 50 L 840 150 M 840 50 L 910 50 Q 930 50, 930 75 Q 930 100, 910 100 L 840 100 M 870 100 L 920 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* I */}
          <path d="M 960 50 L 960 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* C */}
          <path d="M 1050 50 Q 1000 50, 1000 100 Q 1000 150, 1050 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* K */}
          <path d="M 1080 50 L 1080 150 M 1080 100 L 1150 50 M 1080 100 L 1150 150" 
                stroke="#00eeff" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </g>

        {/* Bright core layer */}
        <g>
          {/* S */}
          <path d="M 50 80 Q 50 50, 80 50 Q 110 50, 110 80 Q 110 100, 80 100 Q 50 100, 50 120 Q 50 150, 80 150 Q 110 150, 110 120" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* C */}
          <path d="M 180 50 Q 130 50, 130 100 Q 130 150, 180 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* O */}
          <path d="M 220 100 m 0 -50 a 30 50 0 1 0 0 100 a 30 50 0 1 0 0 -100" 
                stroke="#ffffff" strokeWidth="1.5" fill="none"/>
          
          {/* T */}
          <path d="M 280 50 L 350 50 M 315 50 L 315 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* T */}
          <path d="M 380 50 L 450 50 M 415 50 L 415 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* H */}
          <path d="M 510 50 L 510 150 M 510 100 L 580 100 M 580 50 L 580 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* E */}
          <path d="M 640 50 L 710 50 M 640 50 L 640 150 M 640 100 L 700 100 M 640 150 L 710 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* T */}
          <path d="M 740 50 L 810 50 M 775 50 L 775 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* R */}
          <path d="M 840 50 L 840 150 M 840 50 L 910 50 Q 930 50, 930 75 Q 930 100, 910 100 L 840 100 M 870 100 L 920 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* I */}
          <path d="M 960 50 L 960 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* C */}
          <path d="M 1050 50 Q 1000 50, 1000 100 Q 1000 150, 1050 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          
          {/* K */}
          <path d="M 1080 50 L 1080 150 M 1080 100 L 1150 50 M 1080 100 L 1150 150" 
                stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}
