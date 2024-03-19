import { Example, WordFormData } from './word-pane';
import { useFormContext } from 'react-hook-form';
import { FieldInput } from './field-input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from 'dread-ui';

type ExampleTileProps = {
  example: Example;
  isEditing: boolean;
  index: number;
};

const ExampleTile = ({ example, isEditing, index }: ExampleTileProps) => {
  const { control } = useFormContext<WordFormData>();

  return (
    <li className='flex flex-col gap-2 border p-4 text-start'>
      <FieldInput
        value={example.example}
        isEditing={isEditing}
        fieldName={`examples.${index}.example`}
        label='Example'
        inputComponent={Input}
      />
      {isEditing ? (
        <>
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
          {example.sourceUrl ? (
            <a
              href={example.sourceUrl}
              className='w-fit underline'
              target='_blank'
              rel='noopener noreferrer'
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
