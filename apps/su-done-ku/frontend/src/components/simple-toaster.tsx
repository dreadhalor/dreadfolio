import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      theme='light'
      className='toaster group'
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-slate-600',
          actionButton:
            'group-[.toast]:bg-blue-600 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600',
          closeButton:
            'group-[.toast]:bg-white group-[.toast]:text-slate-600 shadow-md',
        },
      }}
    />
  );
};
