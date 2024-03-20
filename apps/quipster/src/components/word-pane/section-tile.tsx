import { Label } from 'dread-ui';
import { cn } from '@repo/utils';

type SectionTileProps = {
  isEditing: boolean;
  label: string;
  className?: string;
  children: React.ReactNode;
};

const SectionTile = ({
  isEditing,
  label,
  className,
  children,
}: SectionTileProps) => {
  return (
    <div className='flex flex-col items-start gap-2'>
      <Label>{label}</Label>
      <div
        className={cn(
          'flex w-full flex-col gap-2 overflow-hidden rounded-lg border',
          !isEditing && 'items-center',
        )}
      >
        <div
          className={cn(
            'flex w-full flex-col gap-2 p-4 text-start',
            !isEditing && 'items-center',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export { SectionTile };
