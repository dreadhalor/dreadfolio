import { ComplexArrayFormField } from '../form-components/complex-array-form-field';
import { PromptTile } from './prompt-tile';

type PromptSectionProps = {
  isEditing: boolean;
};

const PromptsSection = ({ isEditing }: PromptSectionProps) => {
  const defaultPromptValues = [{ setup: '', prompt: '' }];

  return (
    <ComplexArrayFormField
      name='prompts'
      defaultValues={defaultPromptValues}
      itemComponent={({ item, index, isEditing, onRemove }) => (
        <PromptTile
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

export { PromptsSection };
