export const SecondaryInventory = () => {
  return (
    <div className='grid grid-cols-12 grid-rows-3'>
      {Array.from({ length: 36 }).map((_, index) => (
        <div key={index} className='m-1 h-12 w-12 bg-gray-800' />
      ))}
    </div>
  );
};
