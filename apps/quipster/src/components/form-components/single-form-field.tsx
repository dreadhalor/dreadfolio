import React from 'react';
import { Input, Textarea } from 'dread-ui';
import { SingleFormFieldInput } from './single-form-field-input';

type FieldInputProps = {
  value: string;
  isEditing: boolean;
  fieldName: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputComponent?: React.ComponentType<any>;
  inputProps?: React.ComponentProps<typeof Input | typeof Textarea>;
};

const SingleFormField = ({
  value,
  isEditing,
  fieldName,
  label,
  inputComponent,
  inputProps,
}: FieldInputProps) => {
  return (
    <>
      {isEditing ? (
        <SingleFormFieldInput
          fieldName={fieldName}
          label={label}
          inputComponent={inputComponent}
          inputProps={inputProps}
          defaultValue={value}
        />
      ) : (
        <div>{value || `No ${label.toLowerCase()} provided`}</div>
      )}
    </>
  );
};

export { SingleFormField };
