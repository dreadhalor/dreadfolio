import { Button } from 'dread-ui';
import { ExampleTile } from './example-tile';
import { Example } from './word-pane';

type ExamplesSectionProps = {
  wordInfo: any;
  tempExamples: Example[];
  isEditing: boolean;
  handleAddExample: () => void;
};
const ExamplesSection = ({
  wordInfo,
  tempExamples,
  isEditing,
  handleAddExample,
}: ExamplesSectionProps) => {
  return (
    <>
      {wordInfo.examples?.length > 0 ? (
        <ul>
          {wordInfo.examples.map((example: Example, index: number) => (
            <ExampleTile
              key={example.id}
              example={example}
              isEditing={isEditing}
              index={index}
            />
          ))}
          {tempExamples.map((example: Example, index: number) => (
            <ExampleTile
              key={example.id}
              example={example}
              isEditing={isEditing}
              index={wordInfo.examples.length + index}
            />
          ))}
        </ul>
      ) : (
        <div className='flex flex-col items-center gap-2 rounded-lg border p-4 text-start'>
          No examples provided
        </div>
      )}
      {isEditing && (
        <Button
          type='button'
          className='w-[200px] self-center rounded-md'
          onClick={handleAddExample}
        >
          Add Example
        </Button>
      )}
    </>
  );
};

export { ExamplesSection };
