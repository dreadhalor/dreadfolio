import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../providers/app-provider';
import { Button } from 'dread-ui';

const WordToDefinitionQuiz = () => {
  const { words } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questionWord, setQuestionWord] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [options, setOptions] = useState<any[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState('');

  const wordsWithDefinitions = useMemo(() => {
    return words.filter((word) => word?.definition);
  }, [words]);

  useEffect(() => {
    if (wordsWithDefinitions.length > 0) {
      const randomWord =
        wordsWithDefinitions[
          Math.floor(Math.random() * wordsWithDefinitions.length)
        ];
      setQuestionWord(randomWord);

      const incorrectOptions = wordsWithDefinitions
        .filter((word) => word.word !== randomWord.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((word) => word.definition);

      const allOptions = [randomWord.definition, ...incorrectOptions];
      setOptions(allOptions.sort(() => 0.5 - Math.random()));
    }
  }, [wordsWithDefinitions]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAnswer = (selectedOption: any) => {
    setUserAnswer(selectedOption);
    if (selectedOption === questionWord.definition) {
      setResult('Correct!');
    } else {
      setResult('Incorrect. Please try again.');
    }
  };

  const handleNextQuestion = () => {
    const randomWord =
      wordsWithDefinitions[
        Math.floor(Math.random() * wordsWithDefinitions.length)
      ];
    setQuestionWord(randomWord);

    const incorrectOptions = wordsWithDefinitions
      .filter((word) => word.word !== randomWord.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((word) => word.definition);

    const allOptions = [randomWord.definition, ...incorrectOptions];
    setOptions(allOptions.sort(() => 0.5 - Math.random()));
    setUserAnswer('');
    setResult('');
  };

  return (
    <div className='flex flex-col items-center p-8'>
      <h2 className='mb-4 text-2xl font-bold'>Multiple Choice Quiz</h2>
      {questionWord && (
        <>
          <p className='mb-4'>{questionWord.word}</p>
          <div className='mb-4 grid grid-cols-1 gap-4'>
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                variant={userAnswer === option ? 'default' : 'outline'}
              >
                {option}
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

export { WordToDefinitionQuiz };
