export type Puzzle = {
  sha: string;
  rating: string;
  puzzle: string;
};
export const difficulties = ['easy', 'medium', 'hard'] as const;
export type DifficultySetting = (typeof difficulties)[number];
export type ApiResponseBody = {
  difficulty: DifficultySetting;
  puzzle: Puzzle;
};
