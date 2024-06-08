import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  forwardRef,
  ReactNode,
  HTMLAttributes,
} from 'react';

const MaskingContext = createContext<any>(null);

interface KnockoutLayerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const KnockoutBackground = ({
  children,
  ...props
}: KnockoutLayerProps) => {
  return (
    <div className='absolute inset-0' {...props}>
      {children}
    </div>
  );
};

export const KnockoutForeground = ({
  children,
  ...props
}: KnockoutLayerProps) => {
  return (
    <div className='absolute inset-0' {...props}>
      {children}
    </div>
  );
};

interface KnockoutDivProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  children: ReactNode;
}

export const KnockoutDiv = forwardRef<HTMLDivElement, KnockoutDivProps>(
  ({ id, children, ...props }, ref) => {
    const { registerMaskingDiv } = useContext(MaskingContext);
    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element =
        (ref && 'current' in ref && ref.current) || innerRef.current;
      if (element) {
        registerMaskingDiv(id, element);
      }
    }, [id, ref, registerMaskingDiv]);

    return (
      <div
        id={id}
        ref={ref && 'current' in ref ? ref : innerRef}
        {...props}
        className={`relative flex items-center justify-center rounded-lg bg-white bg-opacity-50 ${props.className}`}
      >
        {children}
      </div>
    );
  },
);

KnockoutDiv.displayName = 'KnockoutDiv';

interface KnockoutEffectProps {
  children: ReactNode;
}
export const KnockoutEffect = ({ children }: KnockoutEffectProps) => {
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

  const registerMaskingDiv = (id: string, element: HTMLDivElement) => {
    divRefs.current.set(id, element);
    updateMaskingDivs();
  };

  const updateMaskingDivs = () => {
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

    // Only update state if measurements have changed
    if (JSON.stringify(newMaskingDivs) !== JSON.stringify(maskingDivs)) {
      setMaskingDivs(newMaskingDivs);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      updateMaskingDivs();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    updateMaskingDivs(); // Call once initially
  }, []);

  return (
    <MaskingContext.Provider value={{ registerMaskingDiv }}>
      <div className='relative h-full w-full'>
        {children}
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
    </MaskingContext.Provider>
  );
};
