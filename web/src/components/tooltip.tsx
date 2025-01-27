import { QuestionMarkIcon } from '@radix-ui/react-icons';
import Button from './button';
import { cn } from '@/utils';
import { JSX } from 'react';

type TooltipProps = {
  text: string;
  icon?: React.ReactNode;
} & JSX.IntrinsicElements['div'];

export default function Tooltip({
  text,
  icon,
  className,
  ...props
}: TooltipProps) {
  return (
    <div {...props} className={cn('tooltip inline', className)} data-tip={text}>
      <Button
        className="btn btn-circle btn-ghost btn-outline no-animation btn-xs cursor-auto hover:bg-transparent hover:text-base-content"
        icon={icon ?? <QuestionMarkIcon width={10} height={10} />}
      />
    </div>
  );
}
