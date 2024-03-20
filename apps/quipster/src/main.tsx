import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.tsx';
import 'dread-ui/built-style.css';
import './index.scss';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Lists } from './routes/lists.tsx';
import { Home } from './routes/home.tsx';
import { List } from './routes/list.tsx';
import { DreadUiProvider } from 'dread-ui';
import { AppProvider } from './providers/app-provider.tsx';
import { TermComponent } from './routes/term.tsx';
import { Words } from './routes/words.tsx';
import { DefinitionToWordQuiz } from './routes/quiz/definition-to-word.tsx';
import { WordToDefinitionQuiz } from './routes/quiz/word-to-definition.tsx';
import { Quiz } from './routes/quiz/quiz.tsx';
import { WordMatchingQuiz } from './routes/quiz/word-matching.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: 'words',
        element: <Words />,
      },
      {
        path: 'words/:word',
        element: <Words />,
      },
      {
        path: 'lists',
        element: <Lists />,
      },
      {
        path: 'lists/:listId',
        element: <List />,
      },
      {
        path: 'term/:termId',
        element: <TermComponent />,
      },
      {
        path: 'quiz',
        element: <Quiz />,
      },
      {
        path: 'quiz/definition-to-word',
        element: <DefinitionToWordQuiz />,
      },
      {
        path: 'quiz/word-to-definition',
        element: <WordToDefinitionQuiz />,
      },
      {
        path: 'quiz/word-matching',
        element: <WordMatchingQuiz />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DreadUiProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </DreadUiProvider>
  </React.StrictMode>,
);
