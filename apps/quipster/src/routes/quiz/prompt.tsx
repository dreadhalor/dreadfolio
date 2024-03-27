import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../providers/app-provider';
import { Button, Textarea } from 'dread-ui';
import { getScenario } from '../../client';

const PromptQuiz = () => {
  const { words } = useApp();
  const [currentWord, setCurrentWord] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  const generateQuestion = useCallback(() => {
    const wordsWithPrompts = words.filter(
      (word) => word.prompts && word.prompts.length > 0,
    );

    if (wordsWithPrompts.length === 0) {
      setCurrentWord(null);
      setCurrentPrompt(null);
      return;
    }

    const randomWord =
      wordsWithPrompts[Math.floor(Math.random() * wordsWithPrompts.length)];
    const randomPrompt =
      randomWord.prompts[Math.floor(Math.random() * randomWord.prompts.length)];

    setCurrentWord(randomWord);
    setCurrentPrompt(randomPrompt);
    setUserResponse('');
    setFeedback('');
  }, [words]);

  const handleSubmit = async () => {
    if (currentWord && currentPrompt) {
      try {
        const response = await getScenario({
          setup: currentPrompt.setup,
          prompt: currentPrompt.prompt,
          expression: currentWord.word,
          response: userResponse,
        });

        const feedback = response.content[0].text.trim();
        setFeedback(feedback);

        if (feedback.toLowerCase().startsWith('correct')) {
          setScore(score + 1);
        }

        setQuestionCount(questionCount + 1);
      } catch (error) {
        console.error('Error evaluating response:', error);
        setFeedback('An error occurred while evaluating your response.');
      }
    }
  };

  useEffect(() => {
    generateQuestion();
  }, [words, generateQuestion]);

  const handleNextQuestion = () => {
    generateQuestion();
  };

  return (
    <div className='mx-auto flex max-w-2xl flex-col items-center py-8'>
      <h2 className='mb-4 text-2xl font-bold'>Prompt Quiz</h2>
      {currentWord && currentPrompt ? (
        <>
          <p className='mb-4'>{currentPrompt.setup}</p>
          <p className='mb-4'>{currentPrompt.prompt}</p>
          <Textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            className='mb-4 w-full'
            rows={4}
          />
          <div className='flex gap-4'>
            <Button onClick={handleSubmit}>Submit</Button>
            <Button onClick={handleNextQuestion} variant='secondary'>
              Next Question
            </Button>
          </div>
          {feedback && <p className='mt-4'>{feedback}</p>}
        </>
      ) : (
        <p>No prompts available.</p>
      )}
      <p className='mt-8'>
        Score: {score} / {questionCount}
      </p>
    </div>
  );
};

export { PromptQuiz };
