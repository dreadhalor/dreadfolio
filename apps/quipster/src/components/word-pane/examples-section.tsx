import { ComplexArrayFormField } from '../form-components/complex-array-form-field';
import { ExampleTile } from './example-tile';

type ExamplesSectionProps = {
  isEditing: boolean;
};

const ExamplesSection = ({ isEditing }: ExamplesSectionProps) => {
  const defaultExampleValues = [{ example: '', source: '', sourceUrl: '' }];

  return (
    <ComplexArrayFormField
      name='examples'
      defaultValues={defaultExampleValues}
      itemComponent={({ item, index, isEditing, onRemove }) => (
        <ExampleTile
          example={item}
          index={index}
          isEditing={isEditing}
          onRemove={onRemove}
        />
      )}
      addButtonLabel='Add Example'
      isEditing={isEditing}
    />
  );
};

export { ExamplesSection };
