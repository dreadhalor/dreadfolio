import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../providers/app-provider';
import { Button, Textarea } from 'dread-ui';

const PromptQuiz = () => {
  const { words } = useApp();
  const [currentWord, setCurrentWord] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [userResponse, setUserResponse] = useState('');

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
  }, [words]);

  const handleSubmit = () => {
    if (currentWord && currentPrompt) {
      // Send the user's response to the AI for evaluation
      console.log('Word:', currentWord.word);
      console.log('Prompt:', currentPrompt.prompt);
      console.log('User Response:', userResponse);
      // Replace the console.log statements with the actual code to send the response to the AI
    }
  };

  useEffect(() => {
    generateQuestion();
  }, [words, generateQuestion]);

  const handleNextQuestion = () => {
    generateQuestion();
  };

  return (
    <div className='flex flex-col items-center p-8'>
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
        </>
      ) : (
        <p>No prompts available.</p>
      )}
    </div>
  );
};

export { PromptQuiz };
