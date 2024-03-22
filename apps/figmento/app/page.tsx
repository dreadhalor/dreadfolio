import { Live } from '@figmento/components/live';
import { Navbar } from '@figmento/components/navbar';

export default function Page() {
  return (
    <main className='flex h-full w-full flex-col'>
      <Navbar />
      <Live />
    </main>
  );
}
