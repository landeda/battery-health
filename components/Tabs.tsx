'use client';
import {
  ComponentProps,
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { clsx } from 'clsx';

export type TabProps = ComponentProps<'button'> & {
  isActive?: boolean;
};

export const Tab: FC<TabProps> = ({ isActive, className, ...props }) => {
  return (
    <button
      type="button"
      className={clsx(className, 'rounded-md p-2 transition-colors cursor-pointer', {
        'text-white bg-primary-500': isActive,
        'text-gray-950': !isActive,
      })}
      role="tab"
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive}
      {...props}
    />
  );
};

export type TabsProps = ComponentProps<'div'>;

export const Tabs: FC<TabsProps> = (props) => {
  return (
    <div
      className="flex p-2 bg-gray-50 gap-2 rounded-lg"
      role="tablist"
      aria-orientation="horizontal"
      {...props}
    />
  );
};
