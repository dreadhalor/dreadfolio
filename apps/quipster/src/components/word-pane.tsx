import { useEffect, useState } from 'react';
import { useApp } from '../providers/app-provider';
import { FaEdit } from 'react-icons/fa';
import {
  Button,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from 'dread-ui';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFormContext } from 'react-hook-form';

type Example = {
  id: string;
  example: string;
  source: string;
};

type WordFormData = {
  definition: string;
  examples: Example[];
};

type ExampleTileProps = {
  example: Example;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  index: number;
};

const ExampleTile = ({
  example,
  isEditing,
  setIsEditing,
  index,
}: ExampleTileProps) => {
  const { control } = useFormContext<WordFormData>();

  return (
    <li className='grid grid-cols-12'>
      <div className='col-span-11 flex flex-col gap-2 rounded-lg border p-4 text-start'>
        {isEditing ? (
          <>
            <FormField
              control={control}
              name={`examples.${index}.example`}
              defaultValue={example.example}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Example</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`examples.${index}.source`}
              defaultValue={example.source}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <span>{example.example}</span>
            <span>{example.source}</span>
          </>
        )}
      </div>
      <div className='col-span-1 flex items-center justify-center'>
        <FaEdit
          className='cursor-pointer text-gray-500 hover:text-white'
          onClick={() => setIsEditing(!isEditing)}
        />
      </div>
    </li>
  );
};

const WordPane = () => {
  const { words, saveWord } = useApp();
  const { word: wordId } = useParams();
  const [wordInfo, setWordInfo] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [tempExamples, setTempExamples] = useState<Example[]>([]);

  const form = useForm<WordFormData>({
    defaultValues: {
      definition: wordInfo.definition || '',
      examples: wordInfo.examples || [],
    },
  });

  useEffect(() => {
    const _word = words.find((word) => word.word === wordId) || {};
    setWordInfo(_word);
    form.reset({
      definition: _word.definition || '',
      examples: _word.examples || [],
    });
  }, [wordId, words, form]);

  const handleSubmit = (data: WordFormData) => {
    saveWord({ ...wordInfo, ...data });
    setIsEditing(false);
  };

  const handleAddExample = () => {
    const newExample = { example: '', source: '', id: uuidv4() };
    setTempExamples((prevExamples) => [...prevExamples, newExample]);
    form.setValue('examples', [...form.getValues('examples'), newExample]);
  };

  useEffect(() => {
    if (!isEditing) {
      form.reset({
        definition: wordInfo.definition || '',
        examples: wordInfo.examples || [],
      });
      setTempExamples([]);
    }
  }, [isEditing, wordInfo, form]);

  const handleCancel = () => {
    setIsEditing(false);
    setTempExamples([]);
  };

  return (
    <div className='flex h-fit w-full max-w-screen-lg flex-col gap-4 p-4 text-center'>
      <h2 className='text-xl font-bold capitalize'>{wordInfo.word}</h2>
      <Form {...form}>
        <div className='mx-auto flex flex-nowrap items-center gap-2'>
          Definition: {wordInfo.definition || 'None'}
          <FaEdit
            className='cursor-pointer text-gray-500 hover:text-white'
            onClick={() => setIsEditing(true)}
          />
        </div>
        {wordInfo.examples?.length > 0 && (
          <ul>
            {wordInfo.examples.map((example: Example, index: number) => (
              <ExampleTile
                key={example.id}
                example={example}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                index={index}
              />
            ))}
            {tempExamples.map((example: Example, index: number) => (
              <ExampleTile
                key={example.id}
                example={example}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                index={wordInfo.examples.length + index}
              />
            ))}
          </ul>
        )}
        {isEditing && (
          <>
            <Button
              type='button'
              className='w-[200px] self-center rounded-md'
              onClick={handleAddExample}
            >
              Add Example
            </Button>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='definition'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Definition</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Definition for ${wordInfo.word}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-nowrap justify-end gap-4'>
                <Button className='rounded-md' type='submit'>
                  Save
                </Button>
                <Button
                  type='button'
                  className='rounded-md'
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </Form>
    </div>
  );
};

export { WordPane };
