import { useState } from 'react';
import { ParticleBackground } from './components/backgrounds/ParticleBackground';
import { WaveBackground } from './components/backgrounds/WaveBackground';
import { GridBackground } from './components/backgrounds/GridBackground';
import { NeonGridBackground } from './components/backgrounds/NeonGridBackground';
import { StarsBackground } from './components/backgrounds/StarsBackground';
import { AmbientParticlesBackground } from './components/backgrounds/AmbientParticlesBackground';
import { ParticleLayer2 } from './components/backgrounds/ParticleLayer2';
import { MinimalistDesign } from './designs/MinimalistDesign';
import { AppleStyleDesign } from './designs/AppleStyleDesign';
import { KineticDesign } from './designs/KineticDesign';
import { SpatialDesign } from './designs/SpatialDesign';
import { UltimateDesign } from './designs/UltimateDesign';
import { NeonDesign } from './designs/NeonDesign';
import { CyberpunkDesign } from './designs/CyberpunkDesign';

const StarfieldComposite = () => (
  <>
    <StarsBackground />
    <ParticleLayer2 />
    <AmbientParticlesBackground />
  </>
);

const designs = [
  { 
    name: 'Cyberpunk', 
    Component: CyberpunkDesign,
    backgrounds: [
      { name: 'Neon Grid', Component: NeonGridBackground },
      { name: 'Starfield', Component: StarfieldComposite },
      { name: 'Grid', Component: GridBackground },
    ],
  },
  { 
    name: 'Neon', 
    Component: NeonDesign,
    backgrounds: [
      { name: 'Starfield', Component: StarfieldComposite },
      { name: 'Particles', Component: ParticleBackground },
      { name: 'Grid', Component: GridBackground },
    ],
  },
  { 
    name: 'Ultimate', 
    Component: UltimateDesign,
    backgrounds: [
      { name: 'Starfield', Component: StarfieldComposite },
      { name: 'Particles', Component: ParticleBackground },
      { name: 'Waves', Component: WaveBackground },
      { name: 'Grid', Component: GridBackground },
    ],
  },
  { 
    name: 'Minimalist', 
    Component: MinimalistDesign,
    backgrounds: [
      { name: 'Particles', Component: ParticleBackground },
      { name: 'Waves', Component: WaveBackground },
      { name: 'Grid', Component: GridBackground },
    ],
  },
  { 
    name: 'Apple', 
    Component: AppleStyleDesign,
    backgrounds: null,
  },
  { 
    name: 'Kinetic', 
    Component: KineticDesign,
    backgrounds: null,
  },
  { 
    name: 'Spatial', 
    Component: SpatialDesign,
    backgrounds: null,
  },
];

function App() {
  const [designIndex, setDesignIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);

  const currentDesign = designs[designIndex];
  const DesignComponent = currentDesign.Component;
  const BackgroundComponent = currentDesign.backgrounds?.[bgIndex]?.Component;

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {BackgroundComponent && <BackgroundComponent />}
      
      {/* Design switcher */}
      <div className="fixed top-6 left-6 z-50 flex flex-col gap-2">
        <div className="text-xs text-slate-500 font-medium px-3 py-1">Design</div>
        <div className="flex gap-2">
          {designs.map((design, index) => (
            <button
              key={design.name}
              onClick={() => {
                setDesignIndex(index);
                setBgIndex(0); // Reset background when switching designs
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                designIndex === index
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {design.name}
            </button>
          ))}
        </div>
      </div>

      {/* Background switcher (only show for designs with multiple backgrounds) */}
      {currentDesign.backgrounds && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
          <div className="text-xs text-slate-500 font-medium px-3 py-1 text-right">Background</div>
          <div className="flex gap-2">
            {currentDesign.backgrounds.map((bg, index) => (
              <button
                key={bg.name}
                onClick={() => setBgIndex(index)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  bgIndex === index
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {bg.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        <DesignComponent />
      </div>
    </div>
  );
}

export default App;
