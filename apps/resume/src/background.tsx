export const Background = () => {
  return (
    <div className='absolute inset-0'>
      <div className='absolute left-64 top-64 h-[200px] w-[200px] rounded-full bg-red-500' />
      <div className='absolute right-64 top-64 h-[200px] w-[200px] rounded-full bg-green-500' />
      <div className='absolute bottom-64 left-64 h-[200px] w-[200px] rounded-full bg-blue-500' />
      <div className='absolute bottom-64 right-64 h-[200px] w-[200px] rounded-full bg-yellow-500' />
    </div>
  );
};
