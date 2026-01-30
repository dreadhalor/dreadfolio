import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'dread-ui';
import { useState } from 'react';
import {
  hiddenSinglePuzzle,
  nakedPairPuzzle,
  hiddenPairPuzzle,
  nakedTriplePuzzle,
  hiddenTriplePuzzle,
  hiddenQuadPuzzle,
  pointingPairPuzzle,
  pointingTriplePuzzle,
  boxLineReductionPuzzle,
} from '../boards';
import { Cell, Step, parseBoard } from '../utils';
import { useBoard } from '../providers/board-context';
import { FaCheck } from 'react-icons/fa';

type PresetPuzzle =
  | 'nakedTriple'
  | 'hiddenSingle'
  | 'nakedPair'
  | 'hiddenPair'
  | 'hiddenTriple'
  | 'hiddenQuad'
  | 'pointingPair'
  | 'pointingTriple'
  | 'boxLineReduction';

const LoadExamplePuzzleButton = () => {
  const [sudokuToLoad, setSudokuToLoad] = useState<string>('');

  const { resetSteps, addStep } = useBoard();

  const loadPuzzle = (puzzle: PresetPuzzle) => {
    let _board: Cell[][] = [];
    switch (puzzle) {
      case 'hiddenSingle':
        _board = parseBoard(hiddenSinglePuzzle);
        break;
      case 'nakedPair':
        _board = parseBoard(nakedPairPuzzle);
        break;
      case 'nakedTriple':
        _board = parseBoard(nakedTriplePuzzle);
        break;
      case 'hiddenPair':
        _board = parseBoard(hiddenPairPuzzle);
        break;
      case 'hiddenTriple':
        _board = parseBoard(hiddenTriplePuzzle);
        break;
      case 'hiddenQuad':
        _board = parseBoard(hiddenQuadPuzzle);
        break;
      case 'pointingPair':
        _board = parseBoard(pointingPairPuzzle);
        break;
      case 'pointingTriple':
        _board = parseBoard(pointingTriplePuzzle);
        break;
      case 'boxLineReduction':
        _board = parseBoard(boxLineReductionPuzzle);
        break;
      default:
        break;
    }
    const initStep: Step = {
      type: 'start',
      boardSnapshot: JSON.parse(JSON.stringify(_board)),
      eliminations: [],
    };
    resetSteps();
    addStep(initStep);
  };

  return (
    <div className='flex flex-nowrap'>
      <Select value={sudokuToLoad} onValueChange={setSudokuToLoad}>
        <SelectTrigger className='w-[200px]'>
          <SelectValue placeholder='Load sudoku'></SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='hiddenSingle'>Hidden Single</SelectItem>
          <SelectItem value='nakedPair'>Naked Pair</SelectItem>
          <SelectItem value='nakedTriple'>Naked Triple</SelectItem>
          <SelectItem value='hiddenPair'>Hidden Pair</SelectItem>
          <SelectItem value='hiddenTriple'>Hidden Triple</SelectItem>
          <SelectItem value='hiddenQuad'>Hidden Quad</SelectItem>
          <SelectItem value='pointingPair'>Pointing Pair</SelectItem>
          <SelectItem value='pointingTriple'>Pointing Triple</SelectItem>
          <SelectItem value='boxLineReduction'>Box/Line Reduction</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={() => loadPuzzle(sudokuToLoad as PresetPuzzle)}
        className='h-9 w-9 shrink-0 rounded-l-none rounded-r-full p-0'
      >
        <FaCheck />
      </Button>
    </div>
  );
};

export { LoadExamplePuzzleButton };
