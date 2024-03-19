import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from 'dread-ui';
import React from 'react';

type FieldInputProps = {
  value: string;
  isEditing: boolean;
  fieldName: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputComponent?: React.ComponentType<any>;
  inputProps?: React.ComponentProps<typeof Input | typeof Textarea>;
};

const FieldInput = ({
  value,
  isEditing,
  fieldName,
  label,
  inputComponent = Input,
  inputProps = {},
}: FieldInputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useFormContext<any>();

  return (
    <>
      {isEditing ? (
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
      ) : (
        <div>{value || `No ${label.toLowerCase()} provided`}</div>
      )}
    </>
  );
};

export { FieldInput };
