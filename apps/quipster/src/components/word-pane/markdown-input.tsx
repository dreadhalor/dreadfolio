import { useFormContext, useWatch } from 'react-hook-form';
import { Input, Label, Textarea } from 'dread-ui';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { FieldInput } from './field-input';

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
    <>
      {isEditing ? (
        <>
          <Label>Preview</Label>
          <ReactMarkdown>
            {fieldValue || `No ${fieldName} provided`}
          </ReactMarkdown>
          <FieldInput
            value={value}
            isEditing={isEditing}
            fieldName={fieldName}
            label={label}
            inputComponent={inputComponent}
            inputProps={inputProps}
          />
        </>
      ) : (
        <ReactMarkdown>{value || `No ${fieldName} provided`}</ReactMarkdown>
      )}
    </>
  );
};

export { MarkdownInput };
