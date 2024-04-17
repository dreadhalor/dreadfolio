import { useEffect, useState } from 'react';
import { useApp } from '../../providers/app-provider';
import { FaEdit } from 'react-icons/fa';
import {
  Button,
  Form,
  Textarea,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from 'dread-ui';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ExamplesSection } from './examples-section';
import { MarkdownInput } from '../form-components/markdown-input';
import { SectionTile } from './section-tile';
import { DefinitionSection } from './definition-section';
import { SingleFormField } from '../form-components/single-form-field';
import { FillInTheBlankQuestionsSection } from './fill-in-the-blank-questions-section';
import { PromptsSection } from './prompts-section';

export type Example = {
  id: string;
  example: string;
  source: string;
  sourceUrl: string;
};

export type FillInTheBlankQuestion = {
  id: string;
  question: string;
  answer: string;
};
export type WordPrompt = {
  id: string;
  prompt: string;
  setup: string;
};

export type WordFormData = {
  word: string;
  definition: string;
  partOfSpeech: string;
  blurb: string;
  background: string;
  examples: Example[];
  fillInTheBlankQuestions: FillInTheBlankQuestion[];
  prompts: WordPrompt[];
};

const DEFAULT_FORM_VALUES: WordFormData = {
  word: '',
  definition: '',
  partOfSpeech: '',
  blurb: '',
  background: '',
  examples: [],
  fillInTheBlankQuestions: [],
  prompts: [],
};

const WordPane = () => {
  const { words, saveWord, lists, addTermToList, removeTermFromList } =
    useApp();
  const { word: wordValue } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wordInfo, setWordInfo] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [includedLists, setIncludedLists] = useState<string[]>([]);

  const form = useForm<WordFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    const _word = words.find((word) => word.word === wordValue) || {};
    setWordInfo(_word);
    form.reset({
      ...DEFAULT_FORM_VALUES,
      ..._word,
    });
    const foundLists = lists
      .filter((list) => {
        const listWords = list.terms || [];
        return listWords.includes(_word.id);
      })
      .map((list) => list.id);
    setIncludedLists(foundLists || []);
  }, [wordValue, words, form, lists]);

  const handleSubmit = (data: WordFormData) => {
    saveWord({ ...wordInfo, ...data });
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) {
      form.reset({
        ...DEFAULT_FORM_VALUES,
        ...wordInfo,
      });
    }
  }, [isEditing, wordInfo, form]);

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleValueChange = (listIds: string[]) => {
    const toAdd = listIds.filter((listId) => !includedLists.includes(listId));
    const toRemove = includedLists.filter(
      (listId) => !listIds.includes(listId),
    );
    toAdd.forEach((listId) => {
      addTermToList(listId, wordInfo.id);
    });
    toRemove.forEach((listId) => {
      removeTermFromList(listId, wordInfo.id);
    });
  };

  return (
    <div className='flex h-fit w-full max-w-screen-lg flex-col gap-4 p-8 pt-4 text-center'>
      <Combobox value={includedLists} onChange={handleValueChange}>
        <ComboboxValue
          disabled={wordInfo?.word === undefined}
          className='w-[200px]'
          placeholder='Add to list'
        />
        <ComboboxContent>
          <ComboboxInput placeholder='Search lists...' />
          <ComboboxEmpty>No lists found.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxGroup>
              {lists.map((list) => (
                <ComboboxItem key={list.id} value={list.id}>
                  {list.name}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Form {...form}>
        <h2 className='flex w-full flex-nowrap items-center justify-center gap-2 text-xl font-bold capitalize'>
          <SingleFormField
            value={wordInfo.word}
            isEditing={isEditing}
            fieldName='word'
            label='Word'
          />

          {wordInfo?.word && (
            <FaEdit
              className='cursor-pointer text-gray-500 hover:text-white'
              onClick={() => setIsEditing(!isEditing)}
            />
          )}
        </h2>

        <SectionTile isEditing={isEditing} label='Definition'>
          <DefinitionSection wordInfo={wordInfo} isEditing={isEditing} />
        </SectionTile>
        <SectionTile isEditing={isEditing} label='Blurb'>
          <MarkdownInput
            value={wordInfo.blurb}
            isEditing={isEditing}
            fieldName='blurb'
            label='Blurb'
            inputComponent={Textarea}
            inputProps={{ rows: 2 }}
          />
        </SectionTile>
        <SectionTile isEditing={isEditing} label='Background'>
          <MarkdownInput
            value={wordInfo.background}
            isEditing={isEditing}
            fieldName='background'
            label='Background'
            inputComponent={Textarea}
            inputProps={{ rows: 4 }}
          />
        </SectionTile>
        <SectionTile
          isEditing={isEditing}
          label={`Fill-in-the-Blank Questions${
            (wordInfo.fillInTheBlankQuestions &&
              ` (${wordInfo.fillInTheBlankQuestions.length})`) ||
            ''
          }`}
          className='max-h-[400px] overflow-auto p-0'
        >
          <FillInTheBlankQuestionsSection isEditing={isEditing} />
        </SectionTile>
        <SectionTile
          isEditing={isEditing}
          label='Examples'
          className='max-h-[400px] overflow-auto p-0'
        >
          <ExamplesSection isEditing={isEditing} />
        </SectionTile>
        <SectionTile
          isEditing={isEditing}
          label='Prompts'
          className='max-h-[400px] overflow-auto p-0'
        >
          <PromptsSection isEditing={isEditing} />
        </SectionTile>
        {isEditing && (
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
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
        )}
      </Form>
    </div>
  );
};

export { WordPane };
