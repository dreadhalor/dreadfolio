import React from 'react';
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

type SingleFormFieldInputProps = {
  fieldName: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputComponent?: React.ComponentType<any>;
  inputProps?: React.ComponentProps<typeof Input | typeof Textarea>;
  defaultValue: string;
};

const SingleFormFieldInput = ({
  fieldName,
  label,
  inputComponent = Input,
  inputProps = {},
  defaultValue,
}: SingleFormFieldInputProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={fieldName}
      defaultValue={defaultValue}
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
  );
};

export { SingleFormFieldInput };
