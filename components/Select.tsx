import clsx from 'clsx';
import { ComponentProps, FC, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectProps = ComponentProps<'select'> & {
  wrapperClassName?: string;
};

export const Select: FC<SelectProps> = forwardRef(
  ({ className, wrapperClassName, ...props }, ref) => (
    <div
      className={clsx(
        'bg-white border w-full rounded-xl border-gray-200 relative flex items-center',
        wrapperClassName
      )}>
      <select
        ref={ref}
        className={clsx(
          'appearance-none py-1.5 px-2 pr-6 w-full rounded-xl active:z-10 focus:z-10 h-full',
          className
        )}
        {...props}
      />
      <ChevronDown className="absolute right-2 z-20 w-4 h-4 pointer-events-none" />
    </div>
  )
);

Select.displayName = 'Select';
