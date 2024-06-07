import { useState, useEffect, useRef, forwardRef } from 'react';

interface MaskingDivProps {
  id: string;
  children: React.ReactNode;
}

const MaskingDiv = forwardRef<HTMLDivElement, MaskingDivProps>(
  ({ id, children }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className='relative flex items-center justify-center rounded-lg bg-white bg-opacity-50'
      >
        {children}
      </div>
    );
  },
);

MaskingDiv.displayName = 'MaskingDiv';

export const KnockoutEffect = () => {
  const [maskingDivs, setMaskingDivs] = useState<
    {
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      borderRadius: number;
    }[]
  >([]);

  const divRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    const handleResize = () => {
      const divElements = Array.from(divRefs.current.values());
      const newMaskingDivs = divElements.map((div) => {
        const rect = div.getBoundingClientRect();
        const style = window.getComputedStyle(div);
        const borderRadius = parseFloat(style.borderRadius);
        return {
          id: div.id,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius,
        };
      });
      setMaskingDivs(newMaskingDivs);
    };

    handleResize(); // Call once initially
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='relative h-screen w-full'>
      {/* Bottom Div */}
      <div className='absolute left-0 top-0 h-full w-full bg-blue-500'></div>

      {/* Masking Divs */}
      <div className='relative z-10 flex h-full w-full flex-wrap items-center justify-center gap-4 p-4'>
        {['mask1', 'mask2'].map((id) => (
          <MaskingDiv
            key={id}
            id={id}
            ref={(el) => el && divRefs.current.set(id, el)}
          >
            <p className='h-[500px] text-black'>Content Inside</p>
          </MaskingDiv>
        ))}
      </div>

      {/* Top Div */}
      <div className='pointer-events-none absolute left-0 top-0 h-full w-full'>
        <svg className='h-full w-full'>
          <defs>
            <clipPath id='clip'>
              {maskingDivs.map((div) => (
                <rect
                  key={div.id}
                  x={div.x}
                  y={div.y}
                  width={div.width}
                  height={div.height}
                  rx={div.borderRadius}
                  ry={div.borderRadius}
                />
              ))}
            </clipPath>
          </defs>
          <rect width='100%' height='100%' fill='red' clipPath='url(#clip)' />
        </svg>
      </div>
    </div>
  );
};
