import { useEffect, useRef, useState } from 'react';
import './GridSquare.scss';

const GridSquare = ({ size, rows, square, setValue, modeRef, dragValRef }) => {
  const gridSquareSize = {
    width: size,
    height: size,
  };
  const resetStyle = {
    transitionProperty: 'background-color',
    transitionDuration: '0.3s',
  };
  const wall_style = {
    opacity: 0,
    boxShadow: 'none',
    transitionProperty: 'opacity',
    transitionDuration: '0.4s',
  };
  const wall_hover_style = {
    opacity: 0.7,
  };
  const start_style = {
    backgroundColor: '#00f000',
  };
  const end_style = {
    backgroundColor: '#ff6b6b',
  };
  const on_path_style = {
    backgroundColor: 'yellow',
  };
  const traversed_style = {
    backgroundColor: 'lightblue',
  };
  const a_star_frontier_style = {
    backgroundColor: '#a3ffaf',
  };
  const frontier_style = {
    backgroundColor: '#ffa3a3',
    // boxShadow: 'none',
  };
  const scan_style = {
    backgroundColor: '#80ff91',
    transitionProperty: 'none',
    boxShadow: 'none',
  };
  const scan_traverse_style = {
    backgroundColor: '#0ae627',
  };

  const getStyle = () => {
    if ((displayVal ?? null) !== null) {
      return {
        ...gridSquareSize,
        backgroundColor: getEllersBackground(),
        transitionProperty: 'none',
      };
    }
    if (pathVal === 4 && val === 0) return { ...gridSquareSize, ...wall_hover_style };
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
  const getClassName = () => {
    let className = 'tile border-l border-t border-slate-500 bg-white';
    if (val === 3) className += ' fade';
    if (pathVal === 1) className += ' animate';
    else if (pathVal === 2) className += ' animate2';
    return className;
  };
  const getEllersBackground = () => {
    const floor = [100, 100, 255];
    const ceiling = [255, 255, 255];

    let range = rows;
    let increment = [];
    let convenience_multiplier = 2;
    for (let i = 0; i < floor.length; i++)
      increment.push(Math.floor(((floor[i] - ceiling[i]) / range) * convenience_multiplier));

    let results = [
      Math.min(floor[0] - increment[0] * displayVal, 255),
      Math.min(floor[1] - increment[1] * displayVal, 255),
      Math.min(floor[2] - increment[2] * displayVal, 255),
    ];

    return `rgb(${results[0]},${results[1]},${results[2]})`;
  };

  const [val, setVal] = useState(0);
  const [pathVal, setPathVal] = useState(0);
  const [displayVal, setDisplayVal] = useState(null);
  const [direction, setDirection] = useState(null);

  const tileRef = useRef();

  const animate = (num) => {
    if (num === 1) {
      tileRef.current.classList.remove('pop');
      void tileRef.current.offsetWidth;
      tileRef.current.classList.add('pop');
    } else if (num === 2) {
      tileRef.current.classList.remove('pop');
      tileRef.current.classList.remove('finish');
      void tileRef.current.offsetWidth;
      tileRef.current.classList.add('finish');
    } else if (num === 3) {
      tileRef.current.classList.remove('pop');
      tileRef.current.classList.remove('finish');
      tileRef.current.classList.remove('reset');
      void tileRef.current.offsetWidth;
      tileRef.current.classList.add('reset');
    }
  };

  const setValMiddleMan = (fxn) => {
    let result = fxn();
    setVal(fxn);
    square.val = result;
  };

  useEffect(() => {
    square.setVal = setValMiddleMan;
    square.setPathVal = setPathVal;
    square.animate = animate;
    square.setDisplayVal = setDisplayVal;
    square.setDirection = setDirection;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let div = tileRef.current;
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
  }, [val, pathVal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    square.val = val;
  }, [val]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    square.pathVal = pathVal;
  }, [pathVal]); // eslint-disable-line react-hooks/exhaustive-deps

  const animationEnd = (event) => {
    let animation_name = event.animationName;
    if (animation_name === 'just_pop') {
      tileRef.current.classList.remove('pop');
      void tileRef.current.offsetWidth;
    } else if (animation_name === 'finished') {
      tileRef.current.classList.remove('finish');
      void tileRef.current.offsetWidth;
    } else if (animation_name === 'reset') {
      tileRef.current.classList.remove('reset');
      void tileRef.current.offsetWidth;
    }
  };

  // console.log('square rendered, size: ' + size);

  //start dragged over end -> dragVal = start, val !== dragVal
  //end dragged over start -> dragVal = end, val !== dragVal
  //wall clicked on start -> dragVal = start, val !== mode
  //start dragged over open tile -> dragVal = start, val === 0
  //end clicked on start -> dragval = start, val = start, mode = end

  //UTTER SPAGHETTI CODE
  const clicked = (event) => {
    let dragVal = dragValRef.current;
    if (dragVal === 1 || dragVal === 2) {
      if ((val === 1 || val === 2) && val !== dragVal) return null;
      if ((modeRef.current === 1 && val === 2) || (modeRef.current === 2 && val === 1)) return null;
      if (modeRef.current === 3 && dragVal === val) return null;
      toggled.current = true;
      return setValue(square.uuid, dragVal);
    }
    toggled.current = true;
    return setValue(square.uuid);
  };
  const mouseDown = (event) => {
    setPathVal(() => 4);
    dragValRef.current = val;
    if (val !== 1 && val !== 2) clicked(event);
  };
  const mouseUp = (event) => {
    setPathVal(() => 0);
    if (dragValRef.current === val && !toggled.current) clicked();
    dragValRef.current = null;
    toggled.current = false;
  };
  const mouseEnter = (event) => {
    let dragVal = dragValRef.current;
    if (event.detail.buttons) {
      if (dragVal === 3) setPathVal(() => 4);
      if (dragVal === val || dragVal === 1 || dragVal === 2) clicked(event);
    } else dragValRef.current = null;
  };
  const mouseLeave = (event) => {
    if (pathVal !== 1 && pathVal !== 2 && pathVal !== 3) setPathVal(() => 0);
    if (!event.detail.buttons) dragValRef.current = null;
    toggled.current = false;
  };
  const toggled = useRef(false);

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
