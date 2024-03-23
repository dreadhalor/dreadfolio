import { LeftSidebar } from '@figmento/components/left-sidebar';
import { Live } from '@figmento/components/live';
import { Navbar } from '@figmento/components/navbar/navbar';
import { RightSidebar } from '@figmento/components/right-sidebar';

export default function Page() {
  return (
    <main className='flex h-full w-full flex-col'>
      <Navbar />
      <section className='flex h-full flex-nowrap'>
        <LeftSidebar />
        <Live />
        <RightSidebar />
      </section>
    </main>
  );
}
