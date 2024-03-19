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
  const wordInfoExamplesLen = wordInfo?.examples?.length || 0;
  const hasExamples = wordInfoExamplesLen > 0;
  const len = wordInfoExamplesLen + tempExamples.length;
  return (
    <>
      {len > 0 ? (
        <ul className='max-h-[400px] overflow-auto rounded-lg border'>
          {hasExamples &&
            wordInfo.examples.map((example: Example, index: number) => (
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
              index={wordInfoExamplesLen + index}
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
