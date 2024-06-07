export const Background = () => {
  return (
    <div className='absolute inset-0'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 opacity-90' />

      {/* Large Blending Circles (Non-Blurred Layer) */}
      <div className='absolute inset-0'>
        <div className='absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-white opacity-50' />
        <div className='absolute -top-1/4 right-1/4 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-white opacity-50' />
        <div className='absolute bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-yellow-500 via-red-500 to-white opacity-50' />
        <div className='absolute -bottom-1/3 right-1/3 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-teal-500 via-purple-500 to-white opacity-50' />
        <div className='-left-1/5 -top-1/5 absolute h-[300px] w-[300px] rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-white opacity-50' />
        <div className='right-1/5 bottom-1/5 absolute h-[350px] w-[350px] rounded-full bg-gradient-to-br from-green-500 via-blue-500 to-white opacity-50' />
      </div>
    </div>
  );
};
