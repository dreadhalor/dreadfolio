import { IGif } from '@giphy/js-types';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { gifAspectRatio } from '../lib/giphy';

type Props = {
  gifs: IGif[];
  renderItem: (gif: IGif, indexInPage: number) => ReactNode;
};

const MIN_COLUMN_WIDTH = 220;
const MAX_COLUMNS = 5;
const GAP_PX = 10;

let lastMeasuredColumns: number | null = null;

/**
 * Height-balanced masonry. Giphy reports every gif's dimensions up front,
 * so each gif goes to the currently-shortest column — deterministic layout,
 * zero shift, no measurement pass (unlike react-masonry-css round-robin).
 */
const MasonryGrid = ({ gifs, renderItem }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // null until measured — nothing renders before the real column count is
  // known, so the first paint is already correct (no reflow shift). Cached
  // across remounts so tab switches render full-height immediately (scroll
  // restoration needs the content height in the first commit).
  const [columnCount, setColumnCount] = useState<number | null>(
    lastMeasuredColumns,
  );

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = (width: number) => {
      const fit = Math.floor((width + GAP_PX) / (MIN_COLUMN_WIDTH + GAP_PX));
      const count = Math.min(MAX_COLUMNS, Math.max(1, fit));
      lastMeasuredColumns = count;
      setColumnCount(count);
    };
    measure(element.clientWidth); // sync, before first paint
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const columns: { gif: IGif; index: number }[][] = Array.from(
    { length: columnCount ?? 0 },
    () => [],
  );
  const heights = new Array(columnCount ?? 0).fill(0);
  gifs.forEach((gif, index) => {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest]?.push({ gif, index });
    heights[shortest] += 1 / gifAspectRatio(gif);
  });

  return (
    <div ref={containerRef} className='flex w-full' style={{ gap: GAP_PX }}>
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className='flex min-w-0 flex-1 flex-col'
          style={{ gap: GAP_PX }}
        >
          {column.map(({ gif, index }) => renderItem(gif, index))}
        </div>
      ))}
    </div>
  );
};

export { MasonryGrid };
