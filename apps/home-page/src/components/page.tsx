import Spline from '@splinetool/react-spline';

const Page = () => {
  return (
    <div className='relative flex h-full w-full overflow-auto'>
      <div className='bg-primary/60 sticky left-0 top-0 flex flex-1 pl-36'>
        <div
          className='text-primary-foreground pointer-events-none relative flex flex-1 flex-col items-center justify-center'
          style={{ textShadow: '0px 0px 20px #000000' }}
        >
          <span className='w-full text-[100px]'> Scott Hetrick</span>
          <span className='w-full text-[24px]'>
            Programming. Pizza. Punchlines.
          </span>
          <span className='w-full text-[24px]'>
            Not necessarily in that order.
          </span>
          <div className='flex'>
            <span>-----</span>
          </div>
        </div>
      </div>
      <div className='bg-primary/60 text-primary-foreground relative flex flex-1 shrink-0 flex-col pr-36'>
        <Spline
          className='absolute inset-0'
          scene='https://prod.spline.design/8KeIdzt7Hi8smpDE/scene.splinecode'
        />
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className='relative w-full border'>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Page };
