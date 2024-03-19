import { ComplexFormField } from './complex-form-field';
import { DefinitionComponent } from './definition-component';

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
