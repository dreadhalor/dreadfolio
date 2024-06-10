import { Separator } from '@dread-ui/index';
import ProfilePic from '@resume/assets/profile-pic.webp';
import { IoMdMailUnread } from 'react-icons/io';
import { IoPizza } from 'react-icons/io5';
import { FaPhone, FaGithub, FaCode } from 'react-icons/fa';
import { TbWorld } from 'react-icons/tb';
import { PiMicrophoneStageFill } from 'react-icons/pi';
import { Card } from '@resume/card';

const ContactInfo = () => (
  <div className='text-foreground grid h-min grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-xs'>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <TbWorld className='text-lg' />
      <a href='https://www.scottjhetrick.com'>scottjhetrick.com</a>
    </div>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <FaGithub className='text-lg' />
      <a href='https://www.github.com/dreadhalor'>dreadhalor</a>
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

const Title = () => (
  <div className='flex flex-1 flex-col'>
    <h1 className='mb-2 text-center text-5xl font-bold uppercase'>
      Scott J. Hetrick
    </h1>
    <div className='flex flex-col gap-1.5'>
      {/* <Separator className='bg-white' /> */}
      <div className='flex items-center gap-2'>
        <div className='flex flex-1 flex-col gap-1'>
          <Separator className='bg-white' />
          <Separator className='bg-white' />
        </div>
        <p className='text-center text-lg font-semibold uppercase leading-[10px]'>
          Software Engineer
        </p>
        <div className='flex flex-1 flex-col gap-1'>
          <Separator className='bg-white' />
          <Separator className='bg-white' />
        </div>
      </div>
      {/* <Separator className='bg-white' /> */}
    </div>
    <span className='mt-2 text-center text-[13px]'>
      <IoPizza className='inline-block' />
      &nbsp;Pizza.&nbsp;
      <FaCode className='inline-block' />
      &nbsp;Programming.&nbsp;
      <PiMicrophoneStageFill className='inline-block' />
      &nbsp;Punchlines.&nbsp;
      <span className='ml-auto opacity-70'>Not necessarily in that order.</span>
    </span>
  </div>
);
export const Header = () => (
  <Card className='flex w-full items-center gap-5 py-3'>
    <div className='border-foreground/50 flex h-24 w-24 justify-center overflow-hidden rounded-full border-0'>
      <img
        src={ProfilePic}
        alt='Profile Picture'
        className='left-full mr-1 aspect-square h-[200px] min-w-[200px]'
      />
    </div>
    <Title />
    <ContactInfo />
  </Card>
);
