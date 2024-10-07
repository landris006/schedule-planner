import { cn } from '@/utils';
import { forwardRef } from 'react';
import Spinner from './spinner';

export type ButtonProps = {
  label?: string | React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
} & JSX.IntrinsicElements['button'];

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { label, icon, isLoading, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'btn flex-nowrap',
        {
          'btn-disabled': isLoading,
        },
        className,
      )}
      {...props}
    >
      {label}
      {isLoading ? <Spinner width={20} height={20} /> : icon}
    </button>
  );
});

export default Button;
