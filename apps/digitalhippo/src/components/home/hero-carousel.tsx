'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@flowerchild/components/ui/carousel';
import { cn } from '@flowerchild/lib/utils';
import {
  Hero1,
  Hero2,
  Hero3,
  Hero4,
  Hero5,
  Hero6,
} from '@flowerchild/assets/hero';
import Image, { StaticImageData } from 'next/image';

type Props = {
  className?: string;
};
const HeroCarouselItem = ({
  src,
  priority = false,
}: {
  src: StaticImageData;
  priority?: boolean;
}) => (
  <CarouselItem className='relative w-full object-cover object-center p-0'>
    <Image
      priority={priority}
      fill
      src={src}
      className='h-full w-full object-cover object-center'
      alt='Edgy hero image'
    />
  </CarouselItem>
);
export const HeroCarousel = ({ className }: Props) => {
  return (
    <Carousel className={cn('group relative z-10 overflow-hidden', className)}>
      <CarouselContent className='m-0 h-full' wrapperClassname='h-full'>
        <HeroCarouselItem src={Hero1} priority />
        <HeroCarouselItem src={Hero2} />
        <HeroCarouselItem src={Hero3} />
        <HeroCarouselItem src={Hero4} />
        <HeroCarouselItem src={Hero5} />
        <HeroCarouselItem src={Hero6} />
      </CarouselContent>
      <div className='pointer-events-none inset-0 opacity-0 transition-[opacity] group-hover:pointer-events-auto group-hover:opacity-100'>
        <CarouselPrevious className={cn('absolute left-2')} />
        <CarouselNext className='absolute right-2' />
      </div>
    </Carousel>
  );
};
