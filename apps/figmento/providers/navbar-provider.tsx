'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { NavElementKey, defaultNavElement } from '@figmento/constants';
import { handleDelete } from '@figmento/lib/key-events';
import {
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleResize,
  initializeFabric,
  renderCanvas,
} from '@figmento/lib/canvas';
import { useMutation, useStorage } from '@figmento/liveblocks.config';

type NavbarContextType = {
  activeElement: NavElementKey;
  handleActiveElement: (elemId: NavElementKey) => void;
  selectedShapeRef: React.MutableRefObject<string | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
};

const NavbarContext = createContext({} as NavbarContextType);

export const useNavbar = () => {
  return useContext(NavbarContext);
};

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeElement, setActiveElement] = useState<NavElementKey>('select');
  const selectedShapeRef = useRef<NavElementKey | null>('select');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);

  const canvasObjects = useStorage((root) => root.canvasObjects);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    if (!storage) return;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;
    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.set(objectId, shapeData);
  }, []);

  useEffect(() => {
    const canvas = initializeFabric({ fabricRef, canvasRef });

    canvas.on('mouse:down', (options) => {
      return handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });

    canvas.on('mouse:up', () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        activeObjectRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
      });
    });

    const resizeListener = () => {
      handleResize({ canvas: fabricRef.current });
    };
    window.addEventListener('resize', resizeListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, [canvasRef]);

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

  const handleActiveElement = (elemId: NavElementKey) => {
    setActiveElement(elemId);

    switch (elemId) {
      // delete all the shapes from the canvas
      case 'reset':
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
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};
