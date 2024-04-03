'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselOptions,
  CarouselPrevious,
} from './ui/carousel';
import { cn } from '@flowerchild/lib/utils';

type Props = {
  urls: string[];
  disableDrag?: boolean;
  opts?: Partial<CarouselOptions>;
};
const ImageCarouselItem = ({ url }: { url: string }) => {
  return (
    <CarouselItem className='aspect-[3/4] pl-0'>
      <div className='relative h-full w-full'>
        <Image
          fill
          loading='eager'
          src={url}
          alt='Product image'
          className='object-cover object-center'
        />
      </div>
    </CarouselItem>
  );
};
export const ImageCarousel = ({ urls, disableDrag = false, opts }: Props) => {
  return (
    <Carousel
      className='group relative overflow-hidden'
      opts={{ watchDrag: () => !disableDrag, ...opts }}
    >
      <CarouselContent className='ml-0'>
        {urls.map((url) => (
          <ImageCarouselItem key={url} url={url} />
        ))}
      </CarouselContent>
      <div className='pointer-events-none inset-0 opacity-0 transition-[opacity] group-hover:pointer-events-auto group-hover:opacity-100'>
        <CarouselPrevious className={cn('absolute left-2')} />
        <CarouselNext className='absolute right-2' />
      </div>
    </Carousel>
  );
};
