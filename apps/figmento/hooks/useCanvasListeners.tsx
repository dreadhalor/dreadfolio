'use client';

import { NavElementKey } from '@figmento/constants';
import {
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handlePathCreated,
  handleResize,
  initializeFabric,
} from '@figmento/lib/canvas';
import { handleKeyDown } from '@figmento/lib/key-events';
import {
  useHistory,
  useMutation,
  useRedo,
  useUndo,
} from '@figmento/liveblocks.config';
import { Attributes } from '@figmento/types/type';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

type Props = {
  fabricRef: MutableRefObject<fabric.Canvas | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  selectedShapeRef: MutableRefObject<NavElementKey | null>;
  setActiveElement: (element: NavElementKey) => void;
  activeObjectRef: MutableRefObject<fabric.Object | null>;
};
export const useCanvasListeners = ({
  fabricRef,
  canvasRef,
  selectedShapeRef,
  setActiveElement,
  activeObjectRef,
}: Props) => {
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const isEditingRef = useRef(false);
  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: '',
    height: '',
    fontSize: '',
    fontFamily: '',
    fontWeight: '',
    fill: '#aabbcc',
    stroke: '#aabbcc',
  });

  const history = useHistory();
  const undo = useUndo();
  const redo = useRedo();

  const syncShapeInStorage = useMutation(
    ({ storage }, object, addToHistory = false) => {
      console.log('add to history', addToHistory);
      history.pause();
      if (addToHistory) history.resume();

      if (!object) return;
      const { objectId } = object;
      const shapeData = object.toJSON();
      shapeData.objectId = objectId;
      const canvasObjects = storage.get('canvasObjects');
      canvasObjects.set(objectId, shapeData);

      if (addToHistory) history.pause();
    },
    [],
  );

  const deleteShapeFromStorage = useMutation(({ storage }, shapeId) => {
    const objs = storage.get('canvasObjects');
    objs.delete(shapeId);
  }, []);

  useEffect(() => {
    const canvas = initializeFabric({ fabricRef, canvasRef });

    canvas.on('mouse:down', (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });

    canvas.on('mouse:move', (options) => {
      handleCanvasMouseMove({
        options,
        canvas,
        selectedShapeRef,
        shapeRef,
        isDrawing,
        syncShapeInStorage,
      });
    });

    canvas.on('mouse:up', () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });

    canvas.on('path:created', (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on('object:modified', (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas?.on('object:moving', (options) => {
      handleCanvasObjectMoving({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on('selection:created', (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
        fabricRef,
      });
    });

    canvas.on('object:scaling', (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
        syncShapeInStorage,
      });
    });

    canvas.on('mouse:wheel', (options) => {
      handleCanvasZoom({
        options,
        canvas,
      });
    });

    const resizeListener = () => {
      handleResize({ canvas: fabricRef.current });
    };
    window.addEventListener('resize', resizeListener);

    const keyListener = (e: KeyboardEvent) =>
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    window.addEventListener('keydown', keyListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('keydown', keyListener);
      canvas.dispose();
    };
  }, [canvasRef]);

  return {
    deleteShapeFromStorage,
    isDrawing,
    shapeRef,
    syncShapeInStorage,
  };
};
