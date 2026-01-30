import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  title: 'Components/Skeleton',
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Some basic skeletons. */
export const Demo: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </div>
  ),
};
