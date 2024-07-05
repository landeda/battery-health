import clsx from 'clsx';
import { ComponentProps, FC } from 'react';

export type FieldsGroupProps = {
  title: string;
} & ComponentProps<'section'>;

export const FieldsGroup: FC<FieldsGroupProps> = ({ title, className, children, ...props }) => (
  <section className={clsx(className)} {...props}>
    <h2 className="mb-3 text-xl font-medium">{title}</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl p-3 gap-2">{children}</div>
  </section>
);
