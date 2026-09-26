import { useEffect, useRef, useState, type CSSProperties, type SetStateAction } from 'react';
import type { Square } from '../types';
import './grid-square.css';

/* How each state looks: a white square with the grid's lines; a wall is a square gone clear,
   the page showing through. */
const STYLES: Record<string, CSSProperties> = {
  empty: { transitionProperty: 'background-color', transitionDuration: '0.3s' },
  wall: { opacity: 0, boxShadow: 'none', transitionProperty: 'opacity', transitionDuration: '0.4s' },
  start: { backgroundColor: '#00f000' },
  end: { backgroundColor: '#ff6b6b' },
  path: { backgroundColor: 'yellow' },
  visited: { backgroundColor: 'lightblue' },
  frontier: { backgroundColor: '#a3ffaf' },
  scan: { backgroundColor: '#80ff91', transitionProperty: 'none', boxShadow: 'none' },
  scanPath: { backgroundColor: '#0ae627' },
  carving: { backgroundColor: '#ffa3a3' },
};

/* Eller's algorithm numbers the sets it's joining: each set a shade from blue toward white. */
function setShade(set: number, rows: number) {
  const floor = [100, 100, 255], ceiling = [255, 255, 255];
  const [r, g, b] = floor.map((f, i) => Math.min(f - Math.floor(((f - ceiling[i]!) / rows) * 2) * set, 255));
  return `rgb(${r},${g},${b})`;
}

type Props = { square: Square; size: number; rows: number };

/**
 * One square. It hands the algorithms its setters (on the Square), keeping the Square's values
 * current as it goes, so a step that sets a square and one that reads it right after agree.
 */
export function GridSquare({ square, size, rows }: Props) {
  const [val, setVal] = useState(0);
  const [pathVal, setPathVal] = useState(0);
  const [displayVal, setDisplayVal] = useState<number | null>(null);
  const [direction, setDirection] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = (action: SetStateAction<number>, prev: number) => (typeof action === 'function' ? action(prev) : action);
    square.val = 0;
    square.pathVal = 0;
    square.setVal = (action) => {
      square.val = next(action, square.val ?? 0);
      setVal(square.val);
    };
    square.setPathVal = (action) => {
      square.pathVal = next(action, square.pathVal ?? 0);
      setPathVal(square.pathVal);
    };
    square.setDisplayVal = setDisplayVal;
    square.setDirection = setDirection;
    // The app's three animations: a pop (placed, carved), the finishing wave, and the reset.
    square.animate = (kind) => {
      const el = ref.current;
      if (!el) return;
      const cls = kind === 1 ? 'pop' : kind === 2 ? 'finish' : 'reset';
      el.classList.remove('pop', ...(kind === 1 ? [] : ['finish']), ...(kind === 3 ? ['reset'] : []));
      void el.offsetWidth;
      el.classList.add(cls);
    };
  }, [square]);

  const style = (): CSSProperties => {
    const box = { width: size, height: size };
    if (displayVal !== null) return { ...box, backgroundColor: setShade(displayVal, rows), transitionProperty: 'none' };
    if (val === 0 && pathVal === 0) return { ...box, ...STYLES.empty };
    if (val === 2) return { ...box, ...STYLES.end };
    if (val === 1) return { ...box, ...STYLES.start };
    if (val === 3) return { ...box, ...STYLES.wall };
    if (pathVal === 2) return { ...box, ...STYLES.path };
    if (pathVal === 1) return { ...box, ...STYLES.visited };
    if (pathVal === 3) return { ...box, ...STYLES.frontier };
    if (val === 5) return { ...box, ...STYLES.scan };
    if (val === 6) return { ...box, ...STYLES.scanPath };
    if (val === 4 || val === 7) return { ...box, ...STYLES.carving };
    return box;
  };

  let className = 'tile border-l border-t border-slate-500 bg-white';
  if (pathVal === 1) className += ' animate';
  else if (pathVal === 2) className += ' animate2';

  return (
    <div
      ref={ref}
      style={style()}
      className={className}
      onAnimationEnd={(e) => {
        const name = e.animationName;
        if (name === 'just_pop') e.currentTarget.classList.remove('pop');
        else if (name === 'finished') e.currentTarget.classList.remove('finish');
        else if (name === 'reset') e.currentTarget.classList.remove('reset');
      }}
    >
      {direction ?? displayVal ?? ''}
    </div>
  );
}
