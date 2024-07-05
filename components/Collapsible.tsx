import clsx from 'clsx';
import {
  ComponentProps,
  FC,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type CollapsibleContextValue = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const collapsibleContext = createContext<CollapsibleContextValue | null>(null);

const useCollapsible = () => {
  const contextValue = useContext(collapsibleContext);
  if (!contextValue) {
    throw new Error('Cannot use collapsible context outside <Collapsible>');
  }
  return contextValue;
};

export type CollapsibleButtonProps = ComponentProps<'button'>;

export const CollapsibleButton: FC<CollapsibleButtonProps> = ({
  children,
  className,
  ...props
}) => {
  const { isOpen, setIsOpen } = useCollapsible();

  const onClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [setIsOpen, isOpen]);

  return (
    <button
      type="button"
      className={clsx(
        'w-full px-4 py-3 relative flex items-center hover:bg-gray-100 cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx('w-4 h-4 pointer-events-none transition-transform ml-auto', {
          'rotate-180': isOpen,
        })}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
};

export type CollapsibleProps = ComponentProps<'div'> & {
  defaultIsOpen?: boolean;
};

export const Collapsible: FC<CollapsibleProps> = ({
  className,
  defaultIsOpen = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const contextValue = useMemo(() => ({ isOpen, setIsOpen }), [isOpen, setIsOpen]);
  return (
    <collapsibleContext.Provider value={contextValue}>
      <div className={clsx('flex flex-col border-gray-200 border-y', className)} {...props} />
    </collapsibleContext.Provider>
  );
};

export type CollapsiblePanelProps = ComponentProps<'div'>;

export const CollapsiblePanel: FC<CollapsiblePanelProps> = (props) => {
  const { isOpen } = useCollapsible();
  if (!isOpen) {
    return null;
  }
  return <div {...props} />;
};
