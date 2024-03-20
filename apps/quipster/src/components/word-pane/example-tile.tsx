import { Example } from './word-pane';
import { SingleFormField } from '../form-components/single-form-field';
import { ComplexFormField } from '../form-components/complex-form-field';
import { Button, Input } from 'dread-ui';

type ExampleTileProps = {
  example: Example;
  isEditing: boolean;
  index: number;
  onRemove: () => void;
};

const ExampleTile = ({
  example,
  isEditing,
  index,
  onRemove,
}: ExampleTileProps) => {
  const sourceFields = [
    {
      value: example.source,
      fieldName: `examples.${index}.source`,
      label: 'Source',
      inputComponent: Input,
    },
    {
      value: example.sourceUrl || '',
      fieldName: `examples.${index}.sourceUrl`,
      label: 'Source URL',
      inputComponent: Input,
    },
  ];

  const sourceComponent = example.sourceUrl ? (
    <a
      href={example.sourceUrl}
      className='w-fit underline'
      target='_blank'
      rel='noopener noreferrer'
    >
      {example.source}
    </a>
  ) : (
    <span>{example.source || 'No source provided'}</span>
  );

  return (
    <div className='flex flex-col gap-2 border-b p-4 text-start group-[.last-item]:border-b-0'>
      <SingleFormField
        value={example.example}
        isEditing={isEditing}
        fieldName={`examples.${index}.example`}
        label='Example'
        inputComponent={Input}
      />
      <ComplexFormField
        fields={sourceFields}
        isEditing={isEditing}
        complexComponent={sourceComponent}
      />
      {isEditing && (
        <Button
          type='button'
          onClick={onRemove}
          className='mt-2 w-[200px] self-center'
        >
          Remove
        </Button>
      )}
    </div>
  );
};

export { ExampleTile };
