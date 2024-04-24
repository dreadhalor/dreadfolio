import { TabImage } from '@dredge/assets/ui';

export const SectionDivider = ({ title }: { title: string }) => {
  return (
    <div className='relative flex w-full items-center justify-start'>
      <img src={TabImage} alt='' />
      <div className='absolute inset-0 flex items-center pl-[16px]'>
        <span className=''>{title}</span>
      </div>
    </div>
  );
};
