import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  baseURL: 'http://localhost:5173/api/',
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export const getScenario = (term: string) => {
  return anthropic.messages.create({
    max_tokens: 1024,
    system:
      'Your task is to take a setup, a prompt, a term, & a response, & determine if the response properly uses the term to answer the prompt in way that makes sense given the setup. Try to keep your response as simple as possible.',
    messages: [],
    model: 'claude-3-sonnet-20240229',
  });
};

type Query = {
  setup: string;
  prompt: string;
  expression: string;
  response: string;
};
export const getScenario2 = ({
  setup,
  prompt,
  expression,
  response,
}: Query) => {
  return anthropic.messages.create({
    max_tokens: 1024,
    system: `Your task is to take an setup, a prompt, an expression, & a response, & judge whether or not the response properly:
      1) uses the expression correctly
      2) answers the prompt
      3) makes sense given the setup
      
      In your response, begin by simply saying "Correct!" or "Incorrect." Keep any explanations as short as possible, because the user will be responding to many prompts & we don't want them to have to read more than necessary.`,
    messages: [
      {
        role: 'user',
        content: `Setup: ${setup} / prompt: ${prompt} / expression: ${expression} / response: ${response}`,
      },
    ],
    model: 'claude-3-sonnet-20240229',
  });
};
