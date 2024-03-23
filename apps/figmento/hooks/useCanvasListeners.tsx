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
import { useMutation } from '@figmento/liveblocks.config';
import { Attributes } from '@figmento/types/type';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

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

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;
    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.set(objectId, shapeData);
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
      });
    });

    canvas.on('selection:created', (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on('object:scaling', (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
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

    return () => {
      window.removeEventListener('resize', resizeListener);
      canvas.dispose();
    };
  }, [canvasRef]);
};
