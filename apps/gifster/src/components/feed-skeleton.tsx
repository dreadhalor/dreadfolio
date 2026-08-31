const HEIGHTS = [180, 240, 150, 300, 210, 170, 260, 190, 230, 160, 280, 200];

/** Shimmer placeholders in the same column layout as the real grid. */
const FeedSkeleton = () => (
  <div className='flex w-full gap-2.5'>
    {[0, 1, 2, 3].map((column) => (
      <div
        key={column}
        className='hidden flex-1 flex-col gap-2.5 first:flex sm:flex'
      >
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className='shimmer w-full rounded-xl'
            style={{ height: HEIGHTS[(column * 3 + row) % HEIGHTS.length] }}
          />
        ))}
      </div>
    ))}
  </div>
);

export { FeedSkeleton };
