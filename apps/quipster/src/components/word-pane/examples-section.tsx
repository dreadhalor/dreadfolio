import { ComplexArrayFormField } from '../form-components/complex-array-form-field';
import { ExampleTile } from './example-tile';

type ExamplesSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isEditing: boolean;
};

const ExamplesSection = ({ isEditing }: ExamplesSectionProps) => {
  const defaultExampleValues = [{ example: '', source: '', sourceUrl: '' }];

  return (
    <ComplexArrayFormField
      name='examples'
      defaultValues={defaultExampleValues}
      itemComponent={({ item, index, isEditing }) => (
        <ExampleTile example={item} index={index} isEditing={isEditing} />
      )}
      addButtonLabel='Add Example'
      isEditing={isEditing}
    />
  );
};

export { ExamplesSection };
