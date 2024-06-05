import { Separator } from '@dread-ui/index';
import ProfilePic from '@resume/assets/profile-pic.webp';
import { IoMdMailUnread } from 'react-icons/io';
import { FaPhone, FaGithub } from 'react-icons/fa';
import { TbWorld } from 'react-icons/tb';

const ContactInfo = () => (
  <div className='bg-background text-foreground grid h-min grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-sm'>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <TbWorld className='text-md' />
      <div>scottjhetrick.com</div>
    </div>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <FaGithub className='text-md' />
      <div>dreadhalor</div>
    </div>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <IoMdMailUnread className='text-md' />
      <span>scotthetrick2@yahoo.com</span>
    </div>
    <div className='col-span-2 grid grid-cols-subgrid items-center'>
      <FaPhone className='text-md' />
      <span>+1 (714) 932-1142</span>
    </div>
  </div>
);
export const Header = () => (
  <div className='flex h-full w-full items-center gap-6'>
    <img
      src={ProfilePic}
      alt='Profile Picture'
      className='border-foreground/50 h-24 w-24 rounded-full border-2'
    />
    <div className='flex flex-1 flex-col'>
      <h1 className='mb-2 text-center text-5xl font-bold uppercase'>
        Scott J. Hetrick
      </h1>
      <div className='flex flex-col gap-4'>
        <Separator className='bg-white' />
        <div className='relative h-[5px] w-full'>
          <Separator className='bg-white' />
          <p className='bg-background absolute left-1/2 top-1/2 mt-[-2px] -translate-x-1/2 -translate-y-1/2 transform px-2 text-center text-lg font-semibold uppercase leading-[10px]'>
            Software Engineer
          </p>
        </div>
      </div>
    </div>
    <ContactInfo />
  </div>
);
