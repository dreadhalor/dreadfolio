import { WordPrompt } from './word-pane';
import { SingleFormField } from '../form-components/single-form-field';
import { Button, Input } from 'dread-ui';

type PromptTileProps = {
  question: WordPrompt;
  isEditing: boolean;
  index: number;
  onRemove: () => void;
};

const PromptTile = ({
  question,
  isEditing,
  index,
  onRemove,
}: PromptTileProps) => {
  return (
    <div className='flex flex-col gap-2 border-b p-4 text-start group-[.last-item]:border-b-0'>
      <SingleFormField
        value={question.setup}
        isEditing={isEditing}
        fieldName={`prompts.${index}.setup`}
        label='Setup'
        inputComponent={Input}
      />
      <SingleFormField
        value={question.prompt}
        isEditing={isEditing}
        fieldName={`prompts.${index}.prompt`}
        label='Prompt'
        inputComponent={Input}
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

export { PromptTile };
