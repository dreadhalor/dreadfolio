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
type BackgroundTileProps = {
  background: string;
  isEditing: boolean;
};

const BackgroundTile = ({ background, isEditing }: BackgroundTileProps) => {
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
          name='background'
          defaultValue={background}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <>{background || 'No background provided'}</>
      )}
    </div>
  );
};

export { BackgroundTile };
