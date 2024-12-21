import { cn } from '@/utils';

type FormFieldProps = {
  label: string;
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
          {required && <span className="text-error">*</span>}
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
