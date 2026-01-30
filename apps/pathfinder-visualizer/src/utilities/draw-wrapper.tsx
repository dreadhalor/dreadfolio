/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react';

const DrawWrapper = ({
  children,
  refToUse,
  style,
  className,
}: {
  children: React.ReactNode;
  refToUse: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  className: string;
}) => {
  const data = useRef<Map<string, { mouseOver: boolean }>>();
  const lastCoords = useRef<[number, number] | null>();
  const lastChild = useRef<HTMLElement | null>();

  useEffect(() => {
    data.current = new Map();
    for (let child of refToUse.current!.children)
      data.current.set(child.id, { mouseOver: false });
  });
  const getChild = (uuid: string) => data.current!.get(uuid) ?? null;

  const makeLine = (x0: number, y0: number, x1: number, y1: number) => {
    let result = new Array<[number, number]>();
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx - dy;

    // eslint-disable-next-line no-constant-condition
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

  const moved = (
    event:
      | React.PointerEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>,
  ) => {
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
  const isInside = ([x, y]: [number, number], child: HTMLElement | Element) => {
    let rect = child.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };
  const processMove = (
    coords: [number, number],
    event:
      | React.PointerEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>,
  ) => {
    if (lastChild.current && isInside(coords, lastChild.current)) return;
    for (let child of refToUse.current!.children) {
      let child_data = getChild(child.id);
      if (isInside(coords, child)) {
        lastChild.current = child as HTMLElement;
        if (child_data !== null && !child_data.mouseOver) {
          child_data.mouseOver = true;
          child.dispatchEvent(
            new CustomEvent('customPointerEnter', {
              detail: {
                buttons: event.buttons,
              },
            }),
          );
        }
      } else if (child_data?.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          }),
        );
      }
    }
  };
  const pointerDown = (
    event:
      | React.PointerEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>,
  ) => {
    let coords: [number, number] = [event.clientX, event.clientY];
    for (let child of refToUse.current!.children) {
      let child_data = getChild(child.id)!;
      if (isInside(coords, child)) {
        child_data.mouseOver = true;
        moved(event);
        child.dispatchEvent(
          new CustomEvent('customPointerDown', {
            detail: {
              buttons: event.buttons,
            },
          }),
        );
      } else if (child_data.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          }),
        );
      }
    }
  };
  const pointerUp = (
    event:
      | React.PointerEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>,
  ) => {
    let coords: [number, number] = [event.clientX, event.clientY];
    for (let child of refToUse.current!.children) {
      let child_data = getChild(child.id)!;
      if (isInside(coords, child)) {
        child.dispatchEvent(
          new CustomEvent('customPointerUp', {
            detail: {
              buttons: event.buttons,
            },
          }),
        );
      } else if (child_data.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          }),
        );
      }
    }
  };
  const pointerLeave = (
    event:
      | React.PointerEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>,
  ) => {
    moved(event);
    lastChild.current = null;
    lastCoords.current = null;
    for (let child of refToUse.current!.children) {
      let child_data = getChild(child.id)!;
      if (child_data.mouseOver) {
        child_data.mouseOver = false;
        child.dispatchEvent(
          new CustomEvent('customPointerLeave', {
            detail: {
              buttons: event.buttons,
            },
          }),
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
