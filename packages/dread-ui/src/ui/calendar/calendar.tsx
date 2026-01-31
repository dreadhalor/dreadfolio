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
          '[&[aria-selected]]:bg-accent relative p-0 text-center focus-within:relative focus-within:z-20',
          '[&:not([aria-selected])]:hover:bg-accent [&:not([aria-selected])]:hover:text-accent-foreground [&:not([aria-selected])]:hover:rounded-full',
          props.mode === 'range'
            ? '[&.day-range-end]:rounded-r-full [&.day-range-start]:rounded-l-full first:[&[aria-selected]]:rounded-l-full last:[&[aria-selected]]:rounded-r-full'
            : '[&[aria-selected]]:rounded-full',
        ),
        day_button: 'h-8 w-8 rounded-full p-0 font-normal text-sm aria-selected:opacity-100',
        selected: cn(
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:rounded-full',
          '[&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
          '[&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground',
        ),
        today: cn('[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:rounded-full'),
        outside: '[&>button]:text-muted-foreground [&>button]:opacity-50',
        disabled: '[&>button]:text-muted-foreground [&>button]:opacity-50',
        range_middle: cn(
          '[&>button]:!text-foreground [&>button]:!bg-transparent [&>button]:rounded-full',
          '[&>button:hover]:!bg-transparent [&>button:hover]:!text-foreground',
        ),
        range_start: cn(
          'day-range-start !rounded-l-full',
          '[&>button]:!bg-primary [&>button]:!text-primary-foreground [&>button]:rounded-full',
        ),
        range_end: cn(
          'day-range-end !rounded-r-full',
          '[&>button]:!bg-primary [&>button]:!text-primary-foreground [&>button]:rounded-full',
        ),
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
