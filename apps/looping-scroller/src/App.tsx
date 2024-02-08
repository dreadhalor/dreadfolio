import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import './App.css';
import {
  useScroll,
  useMotionValueEvent,
  motion,
  useMotionValue,
} from 'framer-motion';

type MovingDivProps = {
  progress?: number;
  index: number;
  style: React.CSSProperties;
};
const MovingDiv = ({ index, style }: MovingDivProps) => {
  return (
    <div className='absolute z-10 h-full w-full' style={style}>
      Div {index}
    </div>
  );
};

type PanelProps = {
  index: number;
  parentRef: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
};
const Panel = ({ index, parentRef, children }: PanelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({
    container: parentRef,
    target: ref,
    offset: ['end start', 'start end'],
    axis: 'x',
  });
  useMotionValueEvent(scrollXProgress, 'change', (progress) => {
    console.log('scrollXProgress', progress);
  });
  return (
    <div
      id={`panel-${index}`}
      ref={ref}
      className='flex h-full w-full shrink-0 snap-center items-center justify-center overflow-hidden border-2 border-white'
    >
      {children}
    </div>
  );
};

function App() {
  const items = Array.from({ length: 101 }, (_, i) => i);
  const movingDivs = Array.from({ length: 8 }, (_, i) => i);
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollToMiddle = useCallback(() => {
    const middlePanel = document.getElementById(
      `panel-${Math.floor(items.length / 2)}`,
    );
    if (middlePanel) {
      middlePanel.scrollIntoView({ behavior: 'instant' });
    }
  }, [items.length]);

  useEffect(() => {
    // scroll to the middle panel on load
    scrollToMiddle();
  }, [scrollToMiddle]);
  const { scrollXProgress } = useScroll({
    container: parentRef,
    layoutEffect: true,
  });

  const [translation, setTranslation] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // output the offset value
    console.log('offset', offset);
  }, [offset]);

  useMotionValueEvent(scrollXProgress, 'change', (progress) => {
    // detect if progress is a multiple of 0.1
    setTranslation(progress);
    const prog2 = progress * 10;
    const rounding = 6;
    const roundingNumber = Math.pow(10, rounding);
    const rounded = Math.round(prog2 * roundingNumber) / roundingNumber;
    if ((rounded * 10) % 1 === 0) {
      console.log('rounded', rounded);
      setOffset((prev) => prev + rounded * 1000 - 5 * 1000);
      scrollToMiddle();
    }
  });

  const getMovingDivs = () => {
    // return the moving divs, but replace the div at index offset/100
  };
  const getDiv = (index: number) => {
    const offsetIndex = offset / 100;
    const newIndex = index - 50 + offsetIndex;
    if (newIndex >= 0) {
      return <div className='h-full w-full'>Div {newIndex}</div>;
    }
    return null;
  };

  return (
    <div className='relative h-full w-full'>
      {/* <div className="pointer-events-none absolute inset-0 z-10 border-4 border-yellow-500">
        {movingDivs.map((i, index) => {
          const left = i * 100 - (scrollXProgress.get() - 0.5) * 10000 - offset;
          // console.log("left", left);
          return (
            <motion.div
              key={i}
              className="absolute top-0 z-10 h-full w-full"
              style={{
                left: `${left}%`,
              }}
            >
              Div {i}
            </motion.div>
          );
        })}
      </div> */}
      <div
        ref={parentRef}
        className='relative flex h-full w-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll border-2 border-red-500'
      >
        {movingDivs.map((i) => (
          <MovingDiv
            key={i}
            index={i}
            style={{
              left: `${i * 100}%`,
              backgroundColor: `hsl(${i * 30}, 100%, 50%)`,
            }}
          />
        ))}
        {items.map((i, index) => (
          <Panel key={i} index={i} parentRef={parentRef}>
            {getDiv(index)}
          </Panel>
        ))}
      </div>
    </div>
  );
}

export default App;
