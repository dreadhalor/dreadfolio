import { Separator } from '@dread-ui/index';
import ProfilePic from '@resume/assets/profile-pic.webp';
import { IoMdMailUnread } from 'react-icons/io';
import { IoPizza } from 'react-icons/io5';
import { FaPhone, FaGithub, FaCode } from 'react-icons/fa';
import { TbWorld } from 'react-icons/tb';
import { PiMicrophoneStageFill } from 'react-icons/pi';

const ContactInfo = () => (
  <div className='bg-background text-foreground grid h-min grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-xs'>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <TbWorld className='text-lg' />
      <div>scottjhetrick.com</div>
    </div>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <FaGithub className='text-lg' />
      <div>dreadhalor</div>
    </div>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <IoMdMailUnread className='text-lg' />
      <span>scotthetrick2@yahoo.com</span>
    </div>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <FaPhone className='text-lg' />
      <span>+1 (714) 932-1142</span>
    </div>
  </div>
);
export const Header = () => (
  <div className='flex h-full w-full items-center gap-4'>
    <div className='border-foreground/50 flex h-24 w-24 justify-center overflow-hidden rounded-full border-2'>
      <img
        src={ProfilePic}
        alt='Profile Picture'
        className='left-full mr-1 aspect-square h-[200px] min-w-[200px]'
      />
    </div>

    <div className='flex flex-1 flex-col'>
      <h1 className='mb-2 text-center text-5xl font-bold uppercase'>
        Scott J. Hetrick
      </h1>
      <div className='flex flex-col gap-3'>
        <Separator className='bg-white' />
        <div className='relative flex h-[5px] w-full flex-col gap-1'>
          <Separator className='bg-white' />
          <Separator className='bg-white' />
          <p className='bg-background absolute left-1/2 top-1/2 mt-[-0px] -translate-x-1/2 -translate-y-1/2 transform px-2 text-center text-lg font-semibold uppercase leading-[10px]'>
            Software Engineer
          </p>
        </div>
      </div>
      <Separator className='mt-3 bg-white' />
      <span className='mt-2 text-center text-sm'>
        <IoPizza className='inline-block' />
        &nbsp;Pizza.&nbsp;
        <FaCode className='inline-block' />
        &nbsp;Programming.&nbsp;
        <PiMicrophoneStageFill className='inline-block' />
        &nbsp;Punchlines.&nbsp;{' '}
        <span className='ml-auto opacity-60'>
          Not necessarily in that order.
        </span>
      </span>
    </div>
    <ContactInfo />
  </div>
);
