import clsx from 'clsx';
import { FC, ReactElement, cloneElement } from 'react';
import { Field, FieldProps } from './Field';
import { Select } from './Select';

type JoinedFieldProps = Omit<FieldProps, 'children'> & {
  Left: ReactElement;
  Right: ReactElement;
};

const renderElement = (element: ReactElement, position: 'left' | 'right') => {
  const className = clsx({
    'rounded-r-none border-r-0': position === 'left',
    'rounded-l-none border-l-0 text-sm': position === 'right',
  });
  if (element.type === Select) {
    return cloneElement(element, {
      className: clsx(element.props['className'], className),
      wrapperClassName: clsx(element.props['wrapperClassName'], className),
    });
  }
  return cloneElement(element, { className: clsx(element.props['className'], className) });
};

export const JoinedField: FC<JoinedFieldProps> = ({ Left, Right, className, ...props }) => {
  return (
    <Field className={clsx('col-span-2', className)} {...props}>
      <div className="flex">
        {renderElement(Left, 'left')}
        <div role="separator" className="bg-gray-200 flex-shrink-0 w-[1px] h-auto" />
        {renderElement(Right, 'right')}
      </div>
    </Field>
  );
};
