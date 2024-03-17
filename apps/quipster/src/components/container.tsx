import { cn } from '@repo/utils';

const Container = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex h-full w-full justify-center', className)}>
      {children}
    </div>
  );
};

export { Container };
