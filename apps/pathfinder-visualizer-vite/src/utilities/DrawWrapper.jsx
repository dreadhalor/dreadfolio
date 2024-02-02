import { useEffect, useRef } from 'react';

const DrawWrapper = ({ children, refToUse, style, className }) => {
  const data = useRef();
  const lastCoords = useRef();
  const lastChild = useRef();
  // console.log('wrapper rendered');
  useEffect(() => {
    data.current = new Map();
    for (let child of refToUse.current.children) data.current.set(child.id, { mouseOver: false });
  });
  const getChild = (uuid) => data.current.get(uuid) ?? null;

  const makeLine = (x0, y0, x1, y1) => {
    let result = [];
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx - dy;

    while (true) {
      result.push([x0, y0]);

      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
    return result;
  };

  const moved = (event) => {
    let [x, y] = [event.clientX, event.clientY];
    let [trunc_x, trunc_y] = [Math.trunc(x), Math.trunc(y)];
    if (lastCoords.current) {
      let [last_x, last_y] = lastCoords.current;
      let interpolated = makeLine(last_x, last_y, trunc_x, trunc_y);
      interpolated.shift();
      for (let coords of interpolated) processMove(coords, event);
    } else processMove([x, y], event);
    lastCoords.current = [trunc_x, trunc_y];
  };
  const isInside = ([x, y], child) => {
    let rect = child.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };
  const processMove = (coords, event) => {
    if (lastChild.current && isInside(coords, lastChild.current)) return;
    for (let child of refToUse.current.children) {
      let child_data = getChild(child.id);
      if (isInside(coords, child)) {
        lastChild.current = child;
        if (child_data !== null && !child_data.mouseOver) {
          child_data.mouseOver = true;
          child.dispatchEvent(
            new CustomEvent('customPointerEnter', {
              detail: {
                buttons: event.buttons,
              },
            })
          );
        }
      } else if (child_data?.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          })
        );
      }
    }
  };
  const pointerDown = (event) => {
    let coords = [event.clientX, event.clientY];
    for (let child of refToUse.current.children) {
      let child_data = getChild(child.id);
      if (isInside(coords, child)) {
        child_data.mouseOver = true;
        moved(event);
        child.dispatchEvent(
          new CustomEvent('customPointerDown', {
            detail: {
              buttons: event.buttons,
            },
          })
        );
      } else if (child_data.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          })
        );
      }
    }
  };
  const pointerUp = (event) => {
    let coords = [event.clientX, event.clientY];
    for (let child of refToUse.current.children) {
      let child_data = getChild(child.id);
      if (isInside(coords, child)) {
        child.dispatchEvent(
          new CustomEvent('customPointerUp', {
            detail: {
              buttons: event.buttons,
            },
          })
        );
      } else if (child_data.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          })
        );
      }
    }
  };
  const pointerLeave = (event) => {
    moved(event);
    lastChild.current = null;
    lastCoords.current = null;
    for (let child of refToUse.current.children) {
      let child_data = getChild(child.id);
      if (child_data.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          })
        );
      }
    }
  };

  return (
    <div
      className={className}
      style={style}
      onPointerMove={moved}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
      onPointerLeave={pointerLeave}
    >
      {children}
    </div>
  );
};

export default DrawWrapper;
