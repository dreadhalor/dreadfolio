import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  baseURL: 'http://localhost:5173/api/',
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export const getScenario = (term: string) => {
  return anthropic.messages.create({
    max_tokens: 1024,
    messages: [
      { role: 'user', content: `I need a scenario for the term "${term}"` },
    ],
    model: 'claude-3-opus-20240229',
  });
};
