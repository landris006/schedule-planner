import { cn } from '@/utils';
import { JSX, forwardRef } from 'react';
import Spinner from './spinner';

const tooltipDirectionMap = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
};

export type ButtonProps = {
  label?: string | React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  tooltip?: string;
  tooltipDirection?: 'top' | 'bottom' | 'left' | 'right';
} & JSX.IntrinsicElements['button'];

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    label,
    title,
    tooltip,
    icon,
    isLoading,
    className,
    tooltipDirection,
    ...props
  },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type="button"
      title={title ? title : typeof label === 'string' ? label : undefined}
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

  return tooltip ? (
    <div
      className={cn(
        'tooltip w-min',
        tooltipDirectionMap[tooltipDirection ?? 'top'],
      )}
      data-tip={tooltip}
    >
      {button}
    </div>
  ) : (
    button
  );
});
export default Button;
