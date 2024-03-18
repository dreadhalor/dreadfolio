import { useEffect, useState } from 'react';
import { useApp } from '../providers/app-provider';
import { FaEdit } from 'react-icons/fa';
import { Button, Input } from 'dread-ui';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

type Example = {
  id: string;
  example: string;
  source: string;
};
type ExampleTileProps = {
  example: Example;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  editExample: (example: Example) => void;
};
const ExampleTile = ({
  example,
  isEditing,
  setIsEditing,
  editExample,
}: ExampleTileProps) => {
  const [exampleCopy, setExampleCopy] = useState(example);
  const { example: exampleText, source, id } = exampleCopy;

  // eslint-disable-next-line
  const exampleTextChange = (e: any) => {
    const text = e.target.value;
    setExampleCopy({ ...exampleCopy, example: text });
  };
  const sourceTextChange = (e: any) => {
    const text = e.target.value;
    setExampleCopy({ ...exampleCopy, source: text });
  };

  useEffect(() => {
    editExample(exampleCopy);
  }, [exampleCopy]);

  return (
    <li className='grid grid-cols-12'>
      <div className='col-span-11 flex flex-col gap-2 rounded-lg border p-4 text-start'>
        {isEditing ? (
          <Input value={exampleCopy.example} onChange={exampleTextChange} />
        ) : (
          <span>{exampleText}</span>
        )}
        {isEditing ? (
          <Input value={exampleCopy.source} onChange={sourceTextChange} />
        ) : (
          <span>{source}</span>
        )}
      </div>
      <div className='col-span-1 flex items-center justify-center'>
        <FaEdit
          className='cursor-pointer text-gray-500 hover:text-white'
          onClick={() => setIsEditing(true)}
        />
      </div>
    </li>
  );
};

const ExamplesSection = () => {};

const WordPane = () => {
  const [wordInfo, setWordInfo] = useState({} as any);
  const [wordInfoCopy, setWordInfoCopy] = useState(
    JSON.parse(JSON.stringify(wordInfo)),
  );
  const [isEditing, setIsEditing] = useState(false);

  const { words, saveWord } = useApp();
  const { word: wordId } = useParams();

  const {
    word: wordOG,
    definition: definitionOG = '',
    examples: examplesOG = [],
  } = wordInfo;
  const { word, examples = [] } = wordInfoCopy;
  const hasExamples = examples.length > 0;

  const editDefinition = (definition: string) => {
    setWordInfoCopy({ ...wordInfoCopy, definition });
  };
  const editExample = (example: Example) => {
    setWordInfoCopy({
      ...wordInfoCopy,
      examples: examples.map((_example) =>
        _example.id === example.id ? example : _example,
      ),
    });
  };

  useEffect(() => {
    const _word = words.find((word) => word.word === wordId) || {};
    setWordInfo(_word);
  }, [wordId, words]);

  useEffect(() => {
    console.log('wordInfo', wordInfo);
    setWordInfoCopy(JSON.parse(JSON.stringify(wordInfo)));
  }, [wordInfo]);

  const sendEdits = () => {
    saveWord({ ...wordInfoCopy });
    setIsEditing(false);
  };

  return (
    <div className='flex w-full max-w-screen-lg flex-col gap-4 p-4 text-center'>
      <h2 className='text-xl font-bold capitalize'>{wordOG}</h2>
      <div className='mx-auto flex flex-nowrap items-center gap-2'>
        Definition: {definitionOG || 'None'}
        <FaEdit
          className='cursor-pointer text-gray-500 hover:text-white'
          onClick={() => setIsEditing(true)}
        />
      </div>
      {isEditing && (
        <Input
          value={wordInfoCopy.definition}
          onChange={(e) => editDefinition(e.target.value)}
          placeholder={`Definition for ${word}`}
        />
      )}
      <div className='flex flex-col'>
        <h2>{`Examples:${hasExamples ? '' : ' None'}`}</h2>
        {hasExamples && (
          <ul>
            {examples.map((example, index) => (
              <ExampleTile
                key={index}
                example={example}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editExample={editExample}
              />
            ))}
          </ul>
        )}
        {isEditing && (
          <Button
            className='rounded-md'
            onClick={() =>
              setWordInfo({
                ...wordInfoCopy,
                examples: [
                  ...examples,
                  { example: 'None', source: 'None', id: uuidv4() },
                ],
              })
            }
          >
            Add Example
          </Button>
        )}
      </div>
      {isEditing && (
        <div className='flex flex-nowrap justify-end gap-4'>
          <Button className='rounded-md' onClick={() => sendEdits()}>
            Save
          </Button>
          <Button className='rounded-md' onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export { WordPane };
