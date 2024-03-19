import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from 'dread-ui';
import { Example, WordFormData } from './word-pane';
import { useFormContext } from 'react-hook-form';

type ExampleTileProps = {
  example: Example;
  isEditing: boolean;
  index: number;
};

const ExampleTile = ({ example, isEditing, index }: ExampleTileProps) => {
  const { control } = useFormContext<WordFormData>();

  return (
    <li className='flex flex-col gap-2 border p-4 text-start'>
      {isEditing ? (
        <>
          <FormField
            control={control}
            name={`examples.${index}.example`}
            defaultValue={example.example}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`examples.${index}.source`}
            defaultValue={example.source}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`examples.${index}.sourceUrl`}
            defaultValue={example.sourceUrl || ''}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SourceUrl</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : (
        <>
          <span>{example.example}</span>
          {example.sourceUrl ? (
            <a
              href={example.sourceUrl}
              className='w-fit hover:underline'
              target='_blank'
            >
              {example.source}
            </a>
          ) : (
            <span>{example.source}</span>
          )}
        </>
      )}
    </li>
  );
};

export { ExampleTile };
