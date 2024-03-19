import { useFormContext, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Textarea,
} from 'dread-ui';
import { cn } from '@repo/utils';
import ReactMarkdown from 'react-markdown';
import React from 'react';

type MarkdownInputProps = {
  value: string;
  isEditing: boolean;
  fieldName: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputComponent?: React.ComponentType<any>;
  inputProps?: React.ComponentProps<typeof Input | typeof Textarea>;
};

const MarkdownInput = ({
  value,
  isEditing,
  fieldName,
  label,
  inputComponent = Input,
  inputProps = {},
}: MarkdownInputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useFormContext<any>();
  const fieldValue = useWatch({
    control,
    name: fieldName,
    defaultValue: isEditing ? value : '',
  });

  return (
    <div className='flex flex-col items-start gap-2'>
      <Label>{label}</Label>
      <div
        className={cn(
          'flex w-full flex-col gap-2 rounded-lg border p-4 text-start',
          !isEditing && 'items-center',
        )}
      >
        {isEditing ? (
          <>
            <Label>Preview</Label>
            <ReactMarkdown>
              {fieldValue || `No ${fieldName} provided`}
            </ReactMarkdown>
            <FormField
              control={control}
              name={fieldName}
              defaultValue={value}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    {React.createElement(inputComponent, {
                      ...field,
                      ...inputProps,
                    })}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <ReactMarkdown>{value || `No ${fieldName} provided`}</ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export { MarkdownInput };
