import './index.css';
import P5 from 'p5';
import { Cubes, Waves, Sand } from './sketches';

const root = document.getElementById('root')!;

// new P5(Cubes, root);
// new P5(Waves, root);
// new P5(SandSketch, root).frameRate(20);
new P5(Sand, root);
