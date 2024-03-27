import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { cn } from '@digitalhippo/lib/utils';

type Props = {
  urls: string[];
};
export const ImageCarousel = ({ urls }: Props) => {
  const url = urls[0];
  return (
    <Carousel className='group relative overflow-hidden rounded-xl'>
      <CarouselContent>
        <CarouselItem className='relative aspect-square w-full object-cover object-center'>
          <Image fill loading='eager' src={url} alt='Product image' />
        </CarouselItem>
        <CarouselItem className='relative aspect-square w-full object-cover object-center'>
          <Image fill loading='eager' src={url} alt='Product image' />
        </CarouselItem>
        <CarouselItem className='relative aspect-square w-full object-cover object-center'>
          <Image fill loading='eager' src={url} alt='Product image' />
        </CarouselItem>
      </CarouselContent>
      <div className='pointer-events-none inset-0 opacity-0 transition-[opacity] group-hover:pointer-events-auto group-hover:opacity-100'>
        <CarouselPrevious className={cn('absolute left-2')} />
        <CarouselNext className='absolute right-2' />
      </div>
    </Carousel>
  );
};
