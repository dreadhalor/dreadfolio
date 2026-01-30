import React, { useEffect, useRef, useState } from 'react';
import './grid-square.css';
import { SetValueProps } from '../app';

interface GridSquareProps {
  size: number;
  rows: number;
  square: {
    uuid: string;
    val?: number;
    setVal?: (fxn: () => number) => void;
    setPathVal?: (val: number) => void;
    pathVal?: number;
    animate?: (num: number) => void;
    setDisplayVal?: (val: number | null) => void;
    setDirection?: (val: string | null) => void;
  };
  setValue: ({
    square_uuid,
    val,
    reset_override,
    checkAchievements,
  }: SetValueProps) => number | null;
  modeRef: React.MutableRefObject<number>;
  dragValRef: React.MutableRefObject<number | null>;
}

const GridSquare = ({
  size,
  rows,
  square,
  setValue,
  modeRef,
  dragValRef,
}: GridSquareProps) => {
  const gridSquareSize = {
    width: size,
    height: size,
  };
  const resetStyle: React.CSSProperties = {
    transitionProperty: 'background-color',
    transitionDuration: '0.3s',
  };
  const wall_style: React.CSSProperties = {
    opacity: 0,
    boxShadow: 'none',
    transitionProperty: 'opacity',
    transitionDuration: '0.4s',
  };
  const wall_hover_style: React.CSSProperties = {
    opacity: 0.7,
  };
  const start_style: React.CSSProperties = {
    backgroundColor: '#00f000',
  };
  const end_style: React.CSSProperties = {
    backgroundColor: '#ff6b6b',
  };
  const on_path_style: React.CSSProperties = {
    backgroundColor: 'yellow',
  };
  const traversed_style: React.CSSProperties = {
    backgroundColor: 'lightblue',
  };
  const a_star_frontier_style: React.CSSProperties = {
    backgroundColor: '#a3ffaf',
  };
  const frontier_style: React.CSSProperties = {
    backgroundColor: '#ffa3a3',
  };
  const scan_style: React.CSSProperties = {
    backgroundColor: '#80ff91',
    transitionProperty: 'none',
    boxShadow: 'none',
  };
  const scan_traverse_style: React.CSSProperties = {
    backgroundColor: '#0ae627',
  };

  const getStyle = (): React.CSSProperties => {
    if ((displayVal ?? null) !== null) {
      return {
        ...gridSquareSize,
        backgroundColor: getEllersBackground(),
        transitionProperty: 'none',
      };
    }
    if (pathVal === 4 && val === 0)
      return { ...gridSquareSize, ...wall_hover_style };
    if (val === 0 && pathVal === 0) return { ...gridSquareSize, ...resetStyle };
    if (val === 2) return { ...gridSquareSize, ...end_style };
    if (val === 1) return { ...gridSquareSize, ...start_style };
    if (val === 3) return { ...gridSquareSize, ...wall_style };
    if (pathVal === 2) return { ...gridSquareSize, ...on_path_style };
    if (pathVal === 1) return { ...gridSquareSize, ...traversed_style };
    if (pathVal === 3) return { ...gridSquareSize, ...a_star_frontier_style };
    if (val === 5) return { ...gridSquareSize, ...scan_style };
    if (val === 6) return { ...gridSquareSize, ...scan_traverse_style };
    if (val === 7) return { ...gridSquareSize, ...frontier_style };
    if (val === 4) return { ...gridSquareSize, ...frontier_style };
    return gridSquareSize;
  };

  const getClassName = (): string => {
    let className = 'tile border-l border-t border-slate-500 bg-white';
    if (val === 3) className += ' fade';
    if (pathVal === 1) className += ' animate';
    else if (pathVal === 2) className += ' animate2';
    return className;
  };

  const getEllersBackground = (): string => {
    const floor = [100, 100, 255];
    const ceiling = [255, 255, 255];

    const range = rows;
    const increment = [];
    const convenience_multiplier = 2;
    for (let i = 0; i < floor.length; i++)
      increment.push(
        Math.floor(
          ((floor[i]! - ceiling[i]!) / range) * convenience_multiplier,
        ),
      );

    const results = [
      Math.min(floor[0]! - increment[0]! * displayVal!, 255),
      Math.min(floor[1]! - increment[1]! * displayVal!, 255),
      Math.min(floor[2]! - increment[2]! * displayVal!, 255),
    ];

    return `rgb(${results[0]},${results[1]},${results[2]})`;
  };

  // State definitions with types
  const [val, setVal] = useState<number>(0);
  const [pathVal, setPathVal] = useState<number>(0);
  const [displayVal, setDisplayVal] = useState<number | null>(null);
  const [direction, setDirection] = useState<string | null>(null);

  const tileRef = useRef<HTMLDivElement>(null);

  const animate = (num: number): void => {
    const tile = tileRef.current;
    if (!tile) return;
    switch (num) {
      case 1:
        tile.classList.remove('pop');
        void tile.offsetWidth;
        tile.classList.add('pop');
        break;
      case 2:
        tile.classList.remove('pop');
        tile.classList.remove('finish');
        void tile.offsetWidth;
        tile.classList.add('finish');
        break;
      case 3:
        tile.classList.remove('pop');
        tile.classList.remove('finish');
        tile.classList.remove('reset');
        void tile.offsetWidth;
        tile.classList.add('reset');
        break;
      default:
        break;
    }
  };

  const setValMiddleMan = (fxn: () => number) => {
    const result = fxn();
    setVal(result);
    if (square) {
      square.val = result;
    }
  };

  useEffect(() => {
    square.setVal = setValMiddleMan;
    square.setPathVal = setPathVal;
    square.animate = animate;
    square.setDisplayVal = setDisplayVal;
    square.setDirection = setDirection;
  }, [square]);

  useEffect(() => {
    const div = tileRef.current;
    if (!div) return;
    div.addEventListener('customPointerEnter', mouseEnter);
    div.addEventListener('customPointerLeave', mouseLeave);
    div.addEventListener('customPointerDown', mouseDown);
    div.addEventListener('customPointerUp', mouseUp);
    return () => {
      div.removeEventListener('customPointerEnter', mouseEnter);
      div.removeEventListener('customPointerLeave', mouseLeave);
      div.removeEventListener('customPointerDown', mouseDown);
      div.removeEventListener('customPointerUp', mouseUp);
    };
  }, [val, pathVal, tileRef.current, setValue]);

  useEffect(() => {
    square.val = val;
  }, [val]);
  useEffect(() => {
    square.pathVal = pathVal;
  }, [pathVal]);

  const animationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    const animation_name = event.animationName;
    const tile = tileRef.current;
    if (!tile) return;
    if (animation_name === 'just_pop') {
      tile.classList.remove('pop');
      void tile.offsetWidth;
    } else if (animation_name === 'finished') {
      tile.classList.remove('finish');
      void tile.offsetWidth;
    } else if (animation_name === 'reset') {
      tile.classList.remove('reset');
      void tile.offsetWidth;
    }
  };

  const clicked = () => {
    const dragVal = dragValRef.current;
    if (dragVal === 1 || dragVal === 2) {
      if ((val === 1 || val === 2) && val !== dragVal) return null;
      if (
        (modeRef.current === 1 && val === 2) ||
        (modeRef.current === 2 && val === 1)
      )
        return null;
      if (modeRef.current === 3 && dragVal === val) return null;
      toggled.current = true;
      return setValue({
        square_uuid: square.uuid,
        val: dragVal,
        checkAchievements: true,
      });
    }
    toggled.current = true;

    return setValue({ square_uuid: square.uuid, checkAchievements: true });
  };

  const mouseDown = () => {
    setPathVal(() => 4);
    dragValRef.current = val;
    if (val !== 1 && val !== 2) clicked();
  };

  const mouseUp = () => {
    setPathVal(() => 0);
    if (dragValRef.current === val && !toggled.current) clicked();
    dragValRef.current = null;
    toggled.current = false;
  };
  const mouseEnter = (event: any) => {
    const dragVal = dragValRef.current;
    if (event.detail.buttons) {
      if (dragVal === 3) setPathVal(() => 4);
      if (dragVal === val || dragVal === 1 || dragVal === 2) clicked();
    } else dragValRef.current = null;
  };
  const mouseLeave = (event: any) => {
    if (pathVal !== 1 && pathVal !== 2 && pathVal !== 3) setPathVal(() => 0);
    if (!event.detail.buttons) dragValRef.current = null;
    toggled.current = false;
  };

  const toggled = useRef<boolean>(false);

  return (
    <div
      id={square.uuid}
      ref={tileRef}
      style={getStyle()}
      className={getClassName()}
      onAnimationEnd={animationEnd}
    >
      {direction ?? displayVal ?? ''}
    </div>
  );
};

export default GridSquare;
