'use client';
import clsx from 'clsx';
import { ComponentProps, FC, ReactNode } from 'react';
import { useFormState } from 'react-hook-form';

export type FieldProps = ComponentProps<'div'> & {
  children: ReactNode;
  label: string;
  id: string;
};

export const Field: FC<FieldProps> = ({ className, label, id, children, ...props }) => {
  const { errors } = useFormState();
  const error = errors[id];

  return (
    <div className={clsx('flex flex-col gap-1 whitespace-nowrap relative', className)} {...props}>
      <label className="text-sm font-normal" htmlFor={id}>
        {label}
      </label>
      {children}
      {error?.message && (
        <span className="z-10 text-xs absolute -bottom-1 p-0.5 opacity-90 translate-y-full bg-red-100 rounded-md text-red-700">
          {error.message.toString()}
        </span>
      )}
    </div>
  );
};
