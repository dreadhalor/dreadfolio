import { Button } from 'dread-ui';
import { useFieldArray, useFormContext } from 'react-hook-form';

type ComplexArrayFormFieldProps = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues: any[];
  itemComponent: React.ComponentType<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
    index: number;
    isEditing: boolean;
    onRemove: () => void;
  }>;
  addButtonLabel: string;
  isEditing: boolean;
};

const ComplexArrayFormField = ({
  name,
  defaultValues,
  itemComponent: ItemComponent,
  addButtonLabel,
  isEditing,
}: ComplexArrayFormFieldProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const handleAddItem = () => {
    append(defaultValues[0]);
  };

  return (
    <div className='flex flex-col items-start gap-2'>
      {fields.length > 0 ? (
        <ul className='max-h-[400px] w-full overflow-auto rounded-lg border'>
          {fields.map((field, index) => (
            <li key={field.id}>
              <ItemComponent
                item={field}
                index={index}
                isEditing={isEditing}
                onRemove={() => remove(index)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className='flex w-full flex-col items-center gap-2 rounded-lg border p-4 text-start'>
          {`No ${name.toLowerCase()} provided`}
        </div>
      )}
      {isEditing && (
        <Button
          type='button'
          className='w-[200px] self-center rounded-full'
          onClick={handleAddItem}
        >
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
};

export { ComplexArrayFormField };
