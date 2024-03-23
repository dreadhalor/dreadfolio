import {
  CircleIcon,
  CommentsIcon,
  DeleteIcon,
  FreeformIcon,
  ImageIcon,
  LineIcon,
  RectangleIcon,
  ResetIcon,
  SelectIcon,
  TextIcon,
  TriangleIcon,
} from '@figmento/public/assets';

export const COLORS = ['#DC2626', '#D97706', '#059669', '#7C3AED', '#DB2777'];

export const shapeElements = [
  {
    id: 'rectangle',
    icon: RectangleIcon,
    name: 'Rectangle',
    value: 'rectangle',
  },
  {
    id: 'circle',
    icon: CircleIcon,
    name: 'Circle',
    value: 'circle',
  },
  {
    id: 'triangle',
    icon: TriangleIcon,
    name: 'Triangle',
    value: 'triangle',
  },
  {
    id: 'line',
    icon: LineIcon,
    name: 'Line',
    value: 'line',
  },
  {
    id: 'image',
    icon: ImageIcon,
    name: 'Image',
    value: 'image',
  },
  {
    id: 'freeform',
    icon: FreeformIcon,
    name: 'Free Drawing',
    value: 'freeform',
  },
] as const;

export const ShapesMenuElement = {
  id: 'shapes',
  icon: RectangleIcon,
  name: 'Rectangle',
  value: shapeElements,
} as const;

export const navElements = [
  {
    id: 'select',
    icon: SelectIcon,
    name: 'Select',
    value: 'Select',
  },
  ShapesMenuElement,
  {
    id: 'text',
    icon: TextIcon,
    value: 'text',
    name: 'Text',
  },
  {
    id: 'delete',
    icon: DeleteIcon,
    value: 'delete',
    name: 'Delete',
  },
  {
    id: 'reset',
    icon: ResetIcon,
    value: 'reset',
    name: 'Reset',
  },
  {
    id: 'comments',
    icon: CommentsIcon,
    value: 'comments',
    name: 'Comments',
  },
] as const;
export type NavElement =
  | (typeof navElements)[number]
  | (typeof shapeElements)[number];

export type NavElementKey = NavElement['id'];

export const defaultNavElement = 'select';

export const directionOptions = [
  { label: 'Bring to Front', value: 'front', icon: '/assets/front.svg' },
  { label: 'Send to Back', value: 'back', icon: '/assets/back.svg' },
];

export const fontFamilyOptions = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Brush Script MT', label: 'Brush Script MT' },
];

export const fontSizeOptions = [
  {
    value: '10',
    label: '10',
  },
  {
    value: '12',
    label: '12',
  },
  {
    value: '14',
    label: '14',
  },
  {
    value: '16',
    label: '16',
  },
  {
    value: '18',
    label: '18',
  },
  {
    value: '20',
    label: '20',
  },
  {
    value: '22',
    label: '22',
  },
  {
    value: '24',
    label: '24',
  },
  {
    value: '26',
    label: '26',
  },
  {
    value: '28',
    label: '28',
  },
  {
    value: '30',
    label: '30',
  },
  {
    value: '32',
    label: '32',
  },
  {
    value: '34',
    label: '34',
  },
  {
    value: '36',
    label: '36',
  },
];

export const fontWeightOptions = [
  {
    value: '400',
    label: 'Normal',
  },
  {
    value: '500',
    label: 'Semibold',
  },
  {
    value: '600',
    label: 'Bold',
  },
];

export const alignmentOptions = [
  { value: 'left', label: 'Align Left', icon: '/assets/align-left.svg' },
  {
    value: 'horizontalCenter',
    label: 'Align Horizontal Center',
    icon: '/assets/align-horizontal-center.svg',
  },
  { value: 'right', label: 'Align Right', icon: '/assets/align-right.svg' },
  { value: 'top', label: 'Align Top', icon: '/assets/align-top.svg' },
  {
    value: 'verticalCenter',
    label: 'Align Vertical Center',
    icon: '/assets/align-vertical-center.svg',
  },
  { value: 'bottom', label: 'Align Bottom', icon: '/assets/align-bottom.svg' },
];

export const shortcuts = [
  {
    key: '1',
    name: 'Chat',
    shortcut: '/',
  },
  {
    key: '2',
    name: 'Undo',
    shortcut: '⌘ + Z',
  },
  {
    key: '3',
    name: 'Redo',
    shortcut: '⌘ + Y',
  },
  {
    key: '4',
    name: 'Reactions',
    shortcut: 'E',
  },
];
