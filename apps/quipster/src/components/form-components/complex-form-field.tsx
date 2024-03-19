import React from 'react';
import { Input, Select, Textarea } from 'dread-ui';
import { SingleFormFieldInput } from './single-form-field-input';

type ComplexFormFieldProps = {
  fields: {
    value: string;
    fieldName: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputComponent?: React.ComponentType<any>;
    inputProps?: React.ComponentProps<
      typeof Input | typeof Textarea | typeof Select
    >;
  }[];
  isEditing: boolean;
  complexComponent: React.ReactNode;
};

const ComplexFormField = ({
  fields,
  isEditing,
  complexComponent,
}: ComplexFormFieldProps) => {
  return (
    <>
      {isEditing
        ? fields.map((field) => (
            <SingleFormFieldInput
              key={field.fieldName}
              fieldName={field.fieldName}
              label={field.label}
              inputComponent={field.inputComponent}
              inputProps={field.inputProps}
              defaultValue={field.value}
            />
          ))
        : complexComponent}
    </>
  );
};

export { ComplexFormField };
