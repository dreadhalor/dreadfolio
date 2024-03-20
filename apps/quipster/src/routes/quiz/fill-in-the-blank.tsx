import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../providers/app-provider';
import { Button } from 'dread-ui';
import { Container } from '../../components/container';

const FillInTheBlankQuiz = () => {
  const { words } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  const generateQuestion = useCallback(() => {
    const wordsWithQuestions = words.filter(
      (word) =>
        word.fillInTheBlankQuestions && word.fillInTheBlankQuestions.length > 0,
    );

    if (wordsWithQuestions.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    const randomWord =
      wordsWithQuestions[Math.floor(Math.random() * wordsWithQuestions.length)];
    const randomQuestion =
      randomWord.fillInTheBlankQuestions[
        Math.floor(Math.random() * randomWord.fillInTheBlankQuestions.length)
      ];

    const incorrectOptions = words
      .filter((word) => word.word !== randomWord.word)
      .map((word) => word.word)
      .slice(0, 3);

    const allOptions = [randomQuestion.answer, ...incorrectOptions];
    const shuffledOptions = allOptions.sort(() => 0.5 - Math.random());

    setCurrentQuestion({ word: randomWord.word, ...randomQuestion });
    setOptions(shuffledOptions);
    setSelectedOption('');
    setResult('');
  }, [words]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleSubmit = () => {
    if (!currentQuestion) return;

    if (
      selectedOption.trim().toLowerCase() ===
      currentQuestion.answer.trim().toLowerCase()
    ) {
      setResult('Correct!');
      setScore(score + 1);
    } else {
      setResult(
        `Incorrect. The correct answer is "${currentQuestion.answer}".`,
      );
    }
    setQuestionCount(questionCount + 1);
  };

  const handleNextQuestion = () => {
    generateQuestion();
  };

  return (
    <Container>
      <div className='flex max-w-screen-lg flex-col items-center p-8'>
        <h2 className='mb-4 text-2xl font-bold'>Fill-in-the-Blank Quiz</h2>
        {currentQuestion ? (
          <>
            <p className='mb-4'>{currentQuestion.question}</p>
            <div className='mb-4 grid grid-cols-2 gap-4'>
              {options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  variant={selectedOption === option ? 'default' : 'outline'}
                >
                  {option}
                </Button>
              ))}
            </div>
            <Button onClick={handleSubmit} className='mb-4'>
              Submit
            </Button>
            {result && (
              <>
                <p className='mb-4'>{result}</p>
                <Button onClick={handleNextQuestion}>Next Question</Button>
              </>
            )}
          </>
        ) : (
          <p>No fill-in-the-blank questions available.</p>
        )}
        <p className='mt-8'>
          Score: {score} / {questionCount}
        </p>
      </div>
    </Container>
  );
};

export { FillInTheBlankQuiz };
