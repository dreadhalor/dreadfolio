import { useState, useEffect } from 'react';
import { useApp } from '../../providers/app-provider';
import { Button } from 'dread-ui';

const WordMatchingQuiz = () => {
  const { words } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quizWords, setQuizWords] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quizDefinitionOrder, setQuizDefinitionOrder] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(
    null,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matchedPairs, setMatchedPairs] = useState<any[]>([]);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (words.length > 0) {
      const randomWords = [...words]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      setQuizWords(randomWords);
    }
  }, [words]);

  useEffect(() => {
    if (quizWords.length > 0) {
      setQuizDefinitionOrder([...quizWords].sort(() => 0.5 - Math.random()));
    }
  }, [quizWords]);

  useEffect(() => {
    if (selectedWord && selectedDefinition) {
      if (selectedWord.definition === selectedDefinition) {
        setMatchedPairs([...matchedPairs, selectedWord]);
        setResult('Correct!');
      } else {
        setResult('Incorrect. Please try again.');
      }
      setSelectedWord(null);
      setSelectedDefinition(null);
    }
  }, [selectedWord, selectedDefinition, matchedPairs]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWordSelect = (word: any) => {
    if (selectedWord === word) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
      setResult('');
    }
  };

  const handleDefinitionSelect = (definition: string) => {
    if (selectedDefinition === definition) {
      setSelectedDefinition(null);
    } else {
      setSelectedDefinition(definition);
      setResult('');
    }
  };

  const handleNextQuiz = () => {
    const randomWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuizWords(randomWords);
    setSelectedWord(null);
    setSelectedDefinition(null);
    setMatchedPairs([]);
    setResult('');
  };

  return (
    <div className='flex flex-col items-center p-8'>
      <h2 className='mb-4 text-2xl font-bold'>Word Matching Quiz</h2>
      <div className='mb-4 grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-2'>
          <h3 className='mb-2 text-xl font-bold'>Words</h3>
          {quizWords.map((word) => (
            <Button
              key={word.word}
              onClick={() => handleWordSelect(word)}
              variant={selectedWord === word ? 'default' : 'outline'}
              disabled={matchedPairs.includes(word)}
            >
              {word.word}
            </Button>
          ))}
        </div>
        <div className='flex flex-col gap-2'>
          <h3 className='mb-2 text-xl font-bold'>Definitions</h3>
          {quizDefinitionOrder.map((word) => (
            <Button
              key={word.definition}
              onClick={() => handleDefinitionSelect(word.definition)}
              variant={
                selectedDefinition === word.definition ? 'default' : 'outline'
              }
              disabled={matchedPairs.includes(word)}
            >
              {word.definition}
            </Button>
          ))}
        </div>
      </div>
      {result && <p className='mt-4'>{result}</p>}
      {matchedPairs.length === quizWords.length && (
        <Button onClick={handleNextQuiz} className='mt-4'>
          Next Quiz
        </Button>
      )}
    </div>
  );
};

export { WordMatchingQuiz };
