import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { readFileSync } from 'fs';
import { join } from 'path';

type Puzzle = {
  sha: string;
  rating: string;
  puzzle: string;
};

const difficulties = ['easy', 'medium', 'hard'] as const;
type DifficultySetting = (typeof difficulties)[number];

type ApiResponseBody = {
  difficulty: DifficultySetting;
  puzzle: Puzzle;
};

// Read puzzle from file and select a random one
const getRandomPuzzle = (difficulty: DifficultySetting): Puzzle => {
  const filePath = join(__dirname, 'puzzles', `${difficulty}.txt`);
  const data = readFileSync(filePath, 'utf-8');
  const lines = data.trim().split('\n');
  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  
  if (!randomLine) {
    throw new Error('No random line found.');
  }
  
  const parts = randomLine.split(' ').filter((predicate) => predicate !== '');
  
  if (parts.length !== 3) {
    throw new Error(`Invalid puzzle format: expected 3 parts, got ${parts.length}`);
  }
  
  const [sha, puzzle, rating] = parts as [string, string, string];
  return { sha, rating, puzzle };
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const difficulty = event.queryStringParameters?.difficulty as DifficultySetting | undefined;
    
    let selectedDifficulty: DifficultySetting;
    
    if (difficulty && difficulties.includes(difficulty)) {
      selectedDifficulty = difficulty;
    } else {
      // No/invalid difficulty provided, pick a random one
      selectedDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    }
    
    const puzzle = getRandomPuzzle(selectedDifficulty);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({
        difficulty: selectedDifficulty,
        puzzle,
      }),
    };
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({
        error: 'An error occurred while fetching a puzzle.',
      }),
    };
  }
};
