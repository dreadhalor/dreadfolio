import { useFormContext, useWatch } from 'react-hook-form';
import { WordFormData } from './word-pane';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
} from 'dread-ui';
import { cn } from '@repo/utils';
import ReactMarkdown from 'react-markdown';

type BlurbTileProps = {
  blurb: string;
  isEditing: boolean;
};

const BlurbTile = ({ blurb, isEditing }: BlurbTileProps) => {
  const { control } = useFormContext<WordFormData>();
  const blurbValue = useWatch({ control, name: 'blurb' });

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-4 text-start',
        !isEditing && 'items-center',
      )}
    >
      {isEditing ? (
        <>
          <Label>Preview</Label>
          <ReactMarkdown>{blurbValue || 'No blurb provided'}</ReactMarkdown>
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
        </>
      ) : (
        <ReactMarkdown>{blurb || 'No blurb provided'}</ReactMarkdown>
      )}
    </div>
  );
};

export { BlurbTile };

// Right, but this still has the problem of initially displaying "No blurb provided" when first switching to editing mode. When switching to editing mode, I'd like the blurbValue to be set to the current blurb value by default. How would I do that?
