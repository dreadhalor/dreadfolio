import { Label } from 'dread-ui';
import { cn } from '@repo/utils';

type SectionTileProps = {
  isEditing: boolean;
  label: string;
  children: React.ReactNode;
};

const SectionTile = ({ isEditing, label, children }: SectionTileProps) => {
  return (
    <div className='flex flex-col items-start gap-2'>
      <Label>{label}</Label>
      <div
        className={cn(
          'flex w-full flex-col gap-2 rounded-lg border p-4 text-start',
          !isEditing && 'items-center',
        )}
      >
        {children}
      </div>
    </div>
  );
};

export { SectionTile };
