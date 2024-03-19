import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../providers/app-provider';
import { Button } from 'dread-ui';

const DefinitionToWordQuiz = () => {
  const { words } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedWords, setSelectedWords] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questionWord, setQuestionWord] = useState<any | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState('');

  const wordsWithDefinitions = useMemo(() => {
    return words.filter((word) => word?.definition);
  }, [words]);

  useEffect(() => {
    if (wordsWithDefinitions.length >= 4) {
      const shuffled = wordsWithDefinitions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      setSelectedWords(selected);
      setQuestionWord(selected[Math.floor(Math.random() * 4)]);
    }
  }, [wordsWithDefinitions]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAnswer = (word: any) => {
    setUserAnswer(word);
    if (word === questionWord.word) {
      setResult('Correct!');
    } else {
      setResult('Incorrect. Please try again.');
    }
  };

  const handleNextQuestion = () => {
    const shuffled = wordsWithDefinitions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setSelectedWords(selected);
    setQuestionWord(selected[Math.floor(Math.random() * 4)]);
    setUserAnswer('');
    setResult('');
  };

  return (
    <div className='flex flex-col items-center'>
      <h2 className='mb-4 text-2xl font-bold'>Quiz</h2>
      {questionWord && (
        <>
          <p className='mb-4'>{questionWord?.definition || ''}</p>
          <div className='mb-4 grid grid-cols-2 gap-4'>
            {selectedWords.map((word) => (
              <Button
                key={word.word}
                onClick={() => handleAnswer(word.word)}
                variant={userAnswer === word.word ? 'default' : 'outline'}
              >
                {word.word}
              </Button>
            ))}
          </div>
          {result && (
            <>
              <p className='mb-4'>{result}</p>
              <Button onClick={handleNextQuestion}>Next Question</Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export { DefinitionToWordQuiz };
