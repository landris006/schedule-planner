import { UpdateIcon } from '@radix-ui/react-icons';
import { cn } from '@/utils';

type SpinnerProps = {
  width?: number;
  height?: number;
} & JSX.IntrinsicElements['div'];

export default function Spinner({
  width,
  height,
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <UpdateIcon
        width={width ?? 50}
        height={height ?? 50}
        className="animate-spin"
      />
    </div>
  );
}
