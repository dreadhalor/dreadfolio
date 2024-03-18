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
type DefinitionTileProps = {
  definition: string;
  isEditing: boolean;
};

const DefinitionTile = ({ definition, isEditing }: DefinitionTileProps) => {
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
          name='definition'
          defaultValue={definition}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Definition</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <>{definition || 'No definition provided'}</>
      )}
    </div>
  );
};

export { DefinitionTile };
