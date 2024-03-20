import { ComplexArrayFormField } from '../form-components/complex-array-form-field';
import { FillInTheBlankQuestionTile } from './fill-in-the-blank-question-tile';

type FillInTheBlankQuestionsSectionProps = {
  isEditing: boolean;
};

const FillInTheBlankQuestionsSection = ({
  isEditing,
}: FillInTheBlankQuestionsSectionProps) => {
  const defaultQuestionValues = [{ question: '', answer: '' }];

  return (
    <ComplexArrayFormField
      name='fillInTheBlankQuestions'
      defaultValues={defaultQuestionValues}
      itemComponent={({ item, index, isEditing, onRemove }) => (
        <FillInTheBlankQuestionTile
          question={item}
          index={index}
          isEditing={isEditing}
          onRemove={onRemove}
        />
      )}
      addButtonLabel='Add Question'
      isEditing={isEditing}
    />
  );
};

export { FillInTheBlankQuestionsSection };
