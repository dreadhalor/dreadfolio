'use client';

import { LoginForm } from '@flowerchild/components/login/login-form';
import { LoginSidebar } from '@flowerchild/components/login/login-sidebar';

const Page = () => {
  return (
    <>
      <div className='bg-background grid h-full w-full grid-cols-3'>
        <div>
          <LoginSidebar />
        </div>
        <div className='container relative flex flex-col items-center justify-center py-20 lg:px-0'>
          <LoginForm />
        </div>
        <div></div>
      </div>
    </>
  );
};

export default Page;
