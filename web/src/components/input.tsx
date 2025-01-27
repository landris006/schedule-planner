import { JSX, forwardRef } from 'react';
import { cn } from '@/utils';

const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements['input']>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn('input input-sm input-bordered', className, {
          'input-error': !!props['aria-invalid'],
        })}
        {...props}
      />
    );
  },
);

export default Input;
