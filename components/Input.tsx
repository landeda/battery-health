import clsx from 'clsx';
import { ComponentProps, FC, forwardRef } from 'react';
import { useFormState } from 'react-hook-form';

export type InputProps = ComponentProps<'input'>;

export const Input: FC<InputProps> = forwardRef(({ className, ...props }, ref) => {
  const { errors } = useFormState();
  const error = props.id && errors[props.id];

  return (
    <input
      ref={ref}
      className={clsx(
        'bg-white border w-full rounded-xl border-gray-200 outline-2 p-1.5 px-2 active:z-10 focus:z-10',
        {
          'outline outline-red-500 z-10': Boolean(error),
        },
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
