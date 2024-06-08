import { useEffect } from 'react';

export const App = () => {
  useEffect(() => {
    const updateMaskingDivs = () => {
      const maskingDivs = document.querySelectorAll('[data-knockout-div]');
      const maskElements = Array.from(maskingDivs).map((div) => {
        const rect = div.getBoundingClientRect();
        const style = window.getComputedStyle(div);
        const borderRadius = parseFloat(style.borderRadius);

        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius,
        };
      });

      const clipPath = document.getElementById('clip');
      if (clipPath) {
        clipPath.innerHTML = ''; // Clear existing clip paths
        maskElements.forEach((maskElement) => {
          const rect = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect',
          );
          rect.setAttribute('x', maskElement.x.toString());
          rect.setAttribute('y', maskElement.y.toString());
          rect.setAttribute('width', maskElement.width.toString());
          rect.setAttribute('height', maskElement.height.toString());
          rect.setAttribute('rx', maskElement.borderRadius.toString());
          rect.setAttribute('ry', maskElement.borderRadius.toString());
          clipPath.appendChild(rect);
        });
      }
    };

    updateMaskingDivs(); // Initial call
    window.addEventListener('resize', updateMaskingDivs);
    return () => {
      window.removeEventListener('resize', updateMaskingDivs);
    };
  }, []);

  return (
    <div className='relative h-[1056px] max-h-[1056px] min-h-[1056px]'>
      <div data-knockout-background className='absolute inset-0'>
        <div className='h-full w-full bg-blue-500' />
      </div>
      <div data-knockout-foreground className='absolute inset-0'>
        <div
          className='h-full w-full bg-red-500'
          style={{
            clipPath: 'url(#clip)',
          }}
        >
          <svg className='h-0 w-0'>
            <defs>
              <clipPath id='clip'></clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className='relative z-10 flex h-full w-full flex-wrap items-center justify-center gap-4 p-4'>
        {['mask1', 'mask2'].map((id) => (
          <div
            key={id}
            data-knockout-div
            className='rounded-lg bg-white bg-opacity-10 p-4'
          >
            <p className='text-black'>Content Inside</p>
          </div>
        ))}
      </div>
    </div>
  );
};
