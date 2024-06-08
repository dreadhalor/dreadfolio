import { cn } from '@repo/utils';

export const Background = ({ className }: { className?: string }) => {
  return (
    <div className={cn('absolute inset-0', className)}>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 opacity-100' />

      {/* Large Blending Circles */}
      <div className={cn('absolute inset-0', className)}>
        <div className='absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-white opacity-50' />
        <div className='absolute -right-1/4 top-0 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-white opacity-50' />
        <div className='absolute left-1/2 top-[100px] h-[400px] w-[400px] rounded-full bg-gradient-to-br from-yellow-500 via-red-500 to-white opacity-50' />
        <div className='absolute bottom-[300px] left-[20px] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-white opacity-50' />
        <div className='absolute bottom-[100px] left-[-100px] h-[350px] w-[350px] rounded-full bg-gradient-to-br from-teal-500 via-purple-500 to-white opacity-50' />
        <div className='absolute -bottom-1/4 right-[-50px] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-green-500 via-blue-500 to-white opacity-50' />
      </div>
    </div>
  );
};
