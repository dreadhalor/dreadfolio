/* eslint-disable react-refresh/only-export-components */
/**
 * Firebase-free barrel: UI primitives only, for apps that don't use auth or
 * achievements — import from 'dread-ui/ui' to keep the firebase graph (pulled
 * in by the providers on the main index) out of the bundle.
 *
 * Deliberately excluded: form, accordion, dropdown-menu, combobox,
 * date-picker, command — they import from '@dread-ui/index' internally, which
 * drags the full barrel (and firebase) back in. Fix those imports before
 * adding them here.
 */
export * from './lib/icons';

export * from './ui/avatar/avatar';
export * from './ui/badge';
export * from './ui/button';
export * from './ui/calendar/calendar';
export * from './ui/card/card';
export * from './ui/checkbox/checkbox';
export * from './ui/dialog/dialog';
export * from './ui/input/input';
export * from './ui/label/label';
export * from './ui/popover/popover';
export * from './ui/radio-group/radio-group';
export * from './ui/resizable/resizable';
export * from './ui/select';
export * from './ui/separator/separator';
export * from './ui/skeleton/skeleton';
export * from './ui/slider/slider';
export * from './ui/sonner/sonner';
export * from './ui/switch/switch';
export * from './ui/tabs/tabs';
export * from './ui/textarea/textarea';
export * from './ui/tooltip/tooltip';
export * from './ui/truncated-text/truncated-text';
