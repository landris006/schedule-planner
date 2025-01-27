import { cn } from '@/utils';
import { JSX, ReactNode } from 'react';

type FormFieldProps = {
  label: string;
  labelIcon?: ReactNode;
  errorMessage?: string;
  required?: boolean;
  preventLabelClick?: boolean;
  children: React.ReactNode;
} & JSX.IntrinsicElements['label'];

export default function FormField({
  label,
  required,
  errorMessage,
  preventLabelClick,
  className,
  labelIcon,
  children,
}: FormFieldProps) {
  return (
    <label
      className={cn('form-control', className)}
      onClick={(e) => preventLabelClick && e.preventDefault()}
    >
      <div className="label">
        <span className="label-text">
          {label}
          {required && <span className="text-error">*</span>} {labelIcon}
        </span>
      </div>

      {children}

      {errorMessage && (
        <div className="label">
          <span className="label-text-alt text-error">{errorMessage}</span>
        </div>
      )}
    </label>
  );
}
