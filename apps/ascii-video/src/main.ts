import './style.css';
import p5 from 'p5';
import { sketch } from './sketch';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.style.width = '100%';
app.style.height = '100%';
// app.innerHTML = ``;

export const draw_margin: [number, number] = [0, 0];

new p5(sketch, app).frameRate(20);
