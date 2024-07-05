'use client';
import clsx from 'clsx';
import { X } from 'lucide-react';
import {
  ComponentProps,
  EventHandler,
  FC,
  MouseEventHandler,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ModalContextValue = {
  currentModalId: string | null;
  open: (modalId: string) => void;
  close: () => void;
};

const modalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentModalId, setCurrentModalId] = useState<string | null>(null);

  const open = useCallback((modalId: string) => {
    setCurrentModalId(modalId);
  }, []);

  const close = useCallback(() => {
    setCurrentModalId(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      open,
      close,
      currentModalId,
    }),
    [open, close, currentModalId]
  );

  return <modalContext.Provider value={contextValue}>{children}</modalContext.Provider>;
};

export const useModal = (modalId: string) => {
  const contextValue = useContext(modalContext);
  if (!contextValue) {
    throw new Error('Cannot use useModal outside <ModalContext>');
  }
  const { currentModalId, open, close } = contextValue;

  return {
    isOpen: currentModalId === modalId,
    open: useCallback(() => {
      open(modalId);
    }, [modalId, open]),
    close,
  };
};

type ModalProps = ComponentProps<'div'> & {
  modalId: string;
  defaultIsOpen?: boolean;
  title: string;
};

export const Modal: FC<ModalProps> = ({
  className,
  modalId,
  defaultIsOpen = false,
  children,
  title,
  ...props
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { isOpen, close, open } = useModal(modalId);
  const [isVisible, setIsVisible] = useState<boolean>(defaultIsOpen);

  useEffect(() => {
    if (defaultIsOpen) {
      open();
    }
  }, [open, defaultIsOpen]);

  const onTransitionEnd = useCallback(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!isVisible && isOpen) {
      setIsVisible(true);
    }
  }, [isVisible, isOpen]);

  const onBackdropClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.target === backdropRef.current) {
        close();
      }
    },
    [close]
  );

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={clsx(
        'flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 bg-gray-950 bg-opacity-50 transition-all z-50 duration-200',
        {
          'opacity-0': !(isOpen && isVisible),
          'opacity-100': isOpen && isVisible,
        }
      )}
      ref={backdropRef}
      onTransitionEnd={onTransitionEnd}
      onClick={onBackdropClick}>
      <div
        className={clsx(
          'flex flex-col max-w-screen-md bg-white max-h-[80vh] rounded-xl py-6',
          className
        )}
        role="dialog"
        {...props}>
        <header className="mb-6 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Disclaimer</h1>
          <button
            type="button"
            onClick={close}
            className="rounded-full hover:bg-gray-50 text-gray-950 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>
        <div className="overflow-y-auto px-6">{children}</div>
      </div>
    </div>
  );
};
