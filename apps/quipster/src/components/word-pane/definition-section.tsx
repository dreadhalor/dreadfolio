import React from 'react';
import { ComplexFormField } from '../form-components/complex-form-field';
import { DefinitionComponent } from './definition-component';
import { useController, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useFormField,
} from 'dread-ui';

type SelectWrapperProps = {
  name: string;
  defaultValue: string;
  children: React.ReactNode;
};

const SelectWrapper = ({
  name,
  defaultValue,
  children,
}: SelectWrapperProps) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control, defaultValue });
  const { formItemId } = useFormField();

  return (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger id={formItemId} className='w-full'>
        <SelectValue placeholder='Select part of speech' />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
};

type ExampleTileProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wordInfo: any;
  isEditing: boolean;
};

const DefinitionSection = ({ wordInfo, isEditing }: ExampleTileProps) => {
  const fields = [
    {
      value: wordInfo.definition,
      fieldName: 'definition',
      label: 'Definition',
    },
    {
      value: wordInfo.partOfSpeech,
      fieldName: 'partOfSpeech',
      label: 'Part of Speech',
      inputComponent: SelectWrapper,
      inputProps: {
        defaultValue: wordInfo.partOfSpeech,
        children: (
          <>
            <SelectItem value='noun'>Noun</SelectItem>
            <SelectItem value='verb'>Verb</SelectItem>
            <SelectItem value='adjective'>Adjective</SelectItem>
            <SelectItem value='adverb'>Adverb</SelectItem>
            <SelectItem value='pronoun'>Pronoun</SelectItem>
            <SelectItem value='preposition'>Preposition</SelectItem>
            <SelectItem value='conjunction'>Conjunction</SelectItem>
            <SelectItem value='interjection'>Interjection</SelectItem>
          </>
        ),
      },
    },
  ];

  const complexComponent = (
    <DefinitionComponent
      definition={wordInfo.definition}
      partOfSpeech={wordInfo.partOfSpeech}
    />
  );

  return (
    <ComplexFormField
      fields={fields}
      isEditing={isEditing}
      complexComponent={complexComponent}
    />
  );
};

export { DefinitionSection };
