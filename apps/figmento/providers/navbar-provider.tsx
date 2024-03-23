'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  NavElementKey,
  defaultNavElement,
  shapeElements,
} from '@figmento/constants';
import { handleDelete } from '@figmento/lib/key-events';
import { renderCanvas } from '@figmento/lib/canvas';
import { useMutation, useStorage } from '@figmento/liveblocks.config';
import { useCanvasListeners } from '@figmento/hooks/useCanvasListeners';

type NavbarContextType = {
  activeElement: NavElementKey;
  handleActiveElement: (elemId: NavElementKey) => void;
  selectedShapeRef: React.MutableRefObject<string | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  lastActiveShape: any;
};

const NavbarContext = createContext({} as NavbarContextType);

export const useNavbar = () => {
  return useContext(NavbarContext);
};

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeElement, setActiveElement] = useState<NavElementKey>('select');
  const [lastActiveShape, setLastActiveShape] = useState<any>(null);
  const selectedShapeRef = useRef<NavElementKey | null>('select');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);

  const canvasObjects = useStorage((root) => root.canvasObjects);

  useCanvasListeners({
    fabricRef,
    canvasRef,
    selectedShapeRef,
    setActiveElement,
    activeObjectRef,
  });

  // render the canvas when the canvasObjects from live storage changes
  useEffect(() => {
    if (!canvasObjects) return;
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

  const deleteShapeFromStorage = useMutation(({ storage }, shapeId) => {
    const objs = storage.get('canvasObjects');
    objs.delete(shapeId);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    // get the canvasObjects store
    const canvasObjects = storage.get('canvasObjects');

    // if the store doesn't exist or is empty, return
    if (!canvasObjects || canvasObjects.size === 0) return true;

    // delete all the shapes from the store
    Array.from(canvasObjects.keys()).forEach((key) => {
      canvasObjects.delete(key);
    });

    // return true if the store is empty
    return canvasObjects.size === 0;
  }, []);

  const handleActiveElement = (elemId: NavElementKey) => {
    const activeShape = shapeElements.find((elem) => elem.id === elemId);
    if (activeShape) {
      setLastActiveShape(activeShape);
    }
    setActiveElement(elemId);

    switch (elemId) {
      // delete all the shapes from the canvas
      case 'reset':
        // clear the storage
        deleteAllShapes();
        // clear the canvas
        fabricRef.current?.clear();
        // set "select" as the active element
        setActiveElement(defaultNavElement);
        break;

      // delete the selected shape from the canvas
      case 'delete':
        // delete it from the canvas
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        // set "select" as the active element
        setActiveElement(defaultNavElement);
        break;

      // upload an image to the canvas
      case 'image':
        break;

      // for comments, do nothing
      case 'comments':
        break;

      default:
        // set the selected shape to the selected element
        selectedShapeRef.current = elemId;
        break;
    }
  };

  return (
    <NavbarContext.Provider
      value={{
        activeElement,
        handleActiveElement,
        selectedShapeRef,
        canvasRef,
        lastActiveShape,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};
