import { useFormContext } from 'react-hook-form';
import { WordFormData } from './word-pane';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from 'dread-ui';
import { cn } from '@repo/utils';
type BlurbTileProps = {
  blurb: string;
  isEditing: boolean;
};

const BlurbTile = ({ blurb, isEditing }: BlurbTileProps) => {
  const { control } = useFormContext<WordFormData>();

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-4 text-start',
        !isEditing && 'items-center',
      )}
    >
      {isEditing ? (
        <FormField
          control={control}
          name='blurb'
          defaultValue={blurb}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blurb</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <>{blurb || 'No blurb provided'}</>
      )}
    </div>
  );
};

export { BlurbTile };
