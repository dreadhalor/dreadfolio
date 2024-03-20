import { Button } from 'dread-ui';
import { Link } from 'react-router-dom';

const Quiz = () => {
  const quizzes = [
    { name: 'Word to Definition', route: '/quiz/word-to-definition' },
    { name: 'Definition to Word', route: '/quiz/definition-to-word' },
    { name: 'Word Matching', route: '/quiz/word-matching' },
  ];

  return (
    <div className='flex flex-col items-center p-8'>
      <h2 className='mb-4 text-2xl font-bold'>Select a Quiz</h2>
      <div className='grid grid-cols-1 gap-4'>
        {quizzes.map((quiz, index) => (
          <Link key={index} to={quiz.route}>
            <Button key={index} variant='outline' className='w-full'>
              {quiz.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export { Quiz };
