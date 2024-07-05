'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

export type NavigationTabProps = { pathname: string; children: string };

export const NavigationTab: FC<NavigationTabProps> = ({ pathname, ...props }) => {
  const currentPathname = usePathname();
  const isActive = pathname === currentPathname;

  return (
    <Link
      href={pathname}
      className={clsx('px-3 py-2 rounded-xl transition-colors cursor-pointer', {
        'text-primary-50 bg-primary-600': isActive,
        'text-primary-600 bg-primary-100 hover:bg-primary-200 transition-colors': !isActive,
      })}
      tabIndex={isActive ? 0 : -1}
      role="tab"
      aria-selected={isActive}
      {...props}
    />
  );
};

export const NavigationTabs: FC = () => {
  return (
    <div
      className="flex gap-3 rounded-2xl justify-self-center z-10"
      role="tablist"
      aria-orientation="horizontal">
      <NavigationTab pathname="/">Electric vehicule</NavigationTab>
      <NavigationTab pathname="/solar">Solar storage</NavigationTab>
    </div>
  );
};
