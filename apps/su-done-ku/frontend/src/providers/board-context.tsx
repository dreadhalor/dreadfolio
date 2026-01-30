import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  Cell,
  CellValue,
  Step,
  createEmptyBoard,
  createEmptyEditingPuzzle,
  executeStep,
  parseAPIBoard,
  parseEditingPuzzle,
} from '../utils';
import { editCell as _editCell } from '../utils/index';
import { ApiResponseBody } from '@repo/su-done-ku-backend/src/types';
import { getBackendBaseUrl } from '@repo/utils';
import { useAchievements } from 'dread-ui';

type BoardContextType = {
  step: Step | null;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
  steps: Step[];
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  sliderValue: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  resetSteps: () => void;
  addStep: (newStep: Step) => void;
  editCell: (cell: Cell, hintValue: CellValue, enabled: boolean) => void;
  isSolved: boolean;
  isErrored: boolean;
  generatePuzzleWithApi: (difficulty?: string) => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  editingPuzzle: string[][];
  setEditingPuzzle: React.Dispatch<React.SetStateAction<string[][]>>;
  loadEditingPuzzle: () => void;
};

export const BoardContext = createContext<BoardContextType>(
  {} as BoardContextType,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

type BoardProviderProps = {
  children: React.ReactNode;
};
export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [step, setStep] = useState<Step>({
    type: 'start',
    boardSnapshot: createEmptyBoard(),
    eliminations: [],
  });
  const [steps, setSteps] = useState<Step[]>([step]);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isErrored, setIsErrored] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingPuzzle, setEditingPuzzle] = useState<string[][]>(
    createEmptyEditingPuzzle(),
  );

  const { unlockAchievementById } = useAchievements();

  useLayoutEffect(() => {
    if (step) {
      const cells = executeStep(step).flat(1);
      const solved = cells.every((cell) => cell.hintValues.length === 1);
      const errored = cells.some((cell) => cell.hintValues.length === 0);
      setIsSolved(!isEditing && solved);
      setIsErrored(!isEditing && errored);
    } else {
      setIsSolved(false);
      setIsErrored(false);
    }
  }, [step, isEditing]);

  const isManualStep = (step: Step) =>
    step.type === 'manual' ||
    step.type === 'crosshatch' ||
    step.type === 'start';

  useEffect(() => {
    if (isSolved) {
      setShowPreview(false);
      unlockAchievementById('solve_puzzle', 'su-done-ku');
      if (steps.length > 1 && steps.every(isManualStep))
        unlockAchievementById('manual_puzzle', 'su-done-ku');
    }
  }, [isSolved, unlockAchievementById, steps]);

  useEffect(() => {
    if (isErrored) {
      setShowPreview(false);
      unlockAchievementById('error_puzzle', 'su-done-ku');
    }
  }, [isErrored, unlockAchievementById]);

  const loadEditingPuzzle = () => {
    const newStep = {
      type: 'start',
      boardSnapshot: JSON.parse(
        JSON.stringify(parseEditingPuzzle(editingPuzzle)),
      ),
      eliminations: [],
    } as Step;
    if (
      newStep.boardSnapshot.flat().some((cell) => cell.hintValues.length === 1)
    )
      unlockAchievementById('import_puzzle', 'su-done-ku');
    resetSteps();
    addStep(newStep);
  };

  useLayoutEffect(() => {
    setEditingPuzzle(() => {
      const newPuzzle = createEmptyEditingPuzzle();
      executeStep(step).forEach((row, rowIndex) =>
        row.forEach((cell, columnIndex) => {
          newPuzzle[rowIndex]![columnIndex] =
            cell.hintValues.length === 1 ? cell.hintValues[0]!.toString() : '';
        }),
      );
      return newPuzzle;
    });
  }, [isEditing, step]);

  useLayoutEffect(() => {
    setSliderValue(steps.length);
  }, [steps]);

  useEffect(() => {
    if (steps.length === 1) return;
    if (sliderValue >= steps.length - 1) return;
    unlockAchievementById('rewind', 'su-done-ku');
  }, [sliderValue, steps.length, unlockAchievementById]);

  const resetSteps = () => {
    setIsEditing(false);
    setSteps(() => []);
  };
  const addStep = (newStep: Step) => {
    setSteps((prev) => {
      const newSteps = prev
        .slice(0, sliderValue + 1)
        // make sure to remove any filler steps that are being overwritten
        .filter((s) => s.type !== 'none');
      return [...newSteps, newStep];
    });
    setStep(newStep);
  };

  const editCell = (cell: Cell, hintValue: CellValue, enabled: boolean) => {
    const _step = _editCell(executeStep(step!), cell, hintValue, enabled);
    const additions = _step.additions?.length ?? 0;
    const eliminations = _step.eliminations?.length ?? 0;
    if (additions || eliminations) {
      addStep(_step);
      setShowPreview(false);
      if (additions) unlockAchievementById('undo_manual_entry', 'su-done-ku');
      if (eliminations) unlockAchievementById('manual_entry', 'su-done-ku');
    }
  };

  const generatePuzzleWithApi = async (difficulty?: string) => {
    const base = getBackendBaseUrl(import.meta.env.PROD);
    try {
      const response = (await fetch(
        `${base}/su-done-ku/api/random${
          difficulty ? `?difficulty=${difficulty}` : ''
        }`,
      ).then((res) => res.json())) as ApiResponseBody;
      const puzzle = parseAPIBoard(response);
      const initStep: Step = {
        type: 'start',
        boardSnapshot: JSON.parse(JSON.stringify(puzzle)),
        eliminations: [],
      };
      resetSteps();
      addStep(initStep);
      switch (difficulty) {
        case 'easy':
          unlockAchievementById('generate_easy_puzzle', 'su-done-ku');
          break;
        case 'medium':
          unlockAchievementById('generate_medium_puzzle', 'su-done-ku');
          break;
        case 'hard':
          unlockAchievementById('generate_hard_puzzle', 'su-done-ku');
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <BoardContext.Provider
      value={{
        step,
        setStep,
        steps,
        setSteps,
        showPreview,
        setShowPreview,
        sliderValue,
        setSliderValue,
        resetSteps,
        addStep,
        editCell,
        isSolved,
        isErrored,
        generatePuzzleWithApi,
        isEditing,
        setIsEditing,
        editingPuzzle,
        setEditingPuzzle,
        loadEditingPuzzle,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
