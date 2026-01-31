import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { DayPicker } from 'react-day-picker';

import { cn } from '@repo/utils';
import { buttonVariants } from '../button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** A calendar component that allows users to enter & edit dates. */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout='around'
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        caption_label:
          'text-sm font-medium h-7 flex items-center justify-center',
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute left-1 top-0 h-7 w-7 p-0',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-1 top-0 h-7 w-7 p-0',
        ),
        month_grid: 'w-full -mt-1',
        weekdays: 'flex',
        weekday: 'caption-1 text-muted-foreground w-8 text-center font-normal',
        week: 'flex w-full mt-2',
        day: cn(
          '[&:has([aria-selected])]:bg-accent relative p-0 text-center focus-within:relative focus-within:z-20',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-full [&:has(>.day-range-start)]:rounded-l-full first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full'
            : '[&:has([aria-selected])]:rounded-full',
        ),
        day_button:
          'h-8 w-8 rounded-full p-0 font-normal text-sm aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground',
        selected: cn(
          'bg-primary text-primary-foreground rounded-full',
          'hover:bg-primary hover:text-primary-foreground',
          'focus:bg-primary focus:text-primary-foreground',
        ),
        today: cn('bg-accent text-accent-foreground rounded-full'),
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: cn(
          'aria-selected:text-accent-foreground aria-selected:bg-transparent',
        ),
        range_start: 'day-range-start',
        range_end: 'day-range-end',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === 'left') {
            return <ChevronLeftIcon className='h-5 w-5' />;
          }
          return <ChevronRightIcon className='h-5 w-5' />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
