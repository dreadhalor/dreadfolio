import { FillInTheBlankQuestion } from './word-pane';
import { SingleFormField } from '../form-components/single-form-field';
import { Button, Input } from 'dread-ui';

type FillInTheBlankQuestionTileProps = {
  question: FillInTheBlankQuestion;
  isEditing: boolean;
  index: number;
  onRemove: () => void;
};

const FillInTheBlankQuestionTile = ({
  question,
  isEditing,
  index,
  onRemove,
}: FillInTheBlankQuestionTileProps) => {
  return (
    <div className='flex flex-col gap-2 border-b p-4 text-start group-[.last-item]:border-b-0'>
      <SingleFormField
        value={question.question}
        isEditing={isEditing}
        fieldName={`fillInTheBlankQuestions.${index}.question`}
        label='Question'
        inputComponent={Input}
      />
      <SingleFormField
        value={question.answer}
        isEditing={isEditing}
        fieldName={`fillInTheBlankQuestions.${index}.answer`}
        label='Answer'
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

export { FillInTheBlankQuestionTile };
