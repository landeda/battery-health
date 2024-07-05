'use client';
import { FC } from 'react';
import { NavigationTabs } from './NavigationTabs';
import { Github, HelpCircle, Microscope, BatteryCharging } from 'lucide-react';
import { useModal } from '@/components/Modal';

const headerRoundButtonClassName =
  'rounded-full p-2 bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors';

export const Header: FC = () => {
  const { open: openDisclaimerModal } = useModal('disclaimer');
  return (
    <header className="grid gap-4 md:gap-8 mb-4 py-4 items-center md:relative">
      <div className="flex md:absolute justify-between w-full">
        <h1 className="flex items-center text-2xl md:text-lg lg:text-2xl text-primary-700 font-semibold">
          <BatteryCharging className="w-10 h-10 mr-2 lg:mr-3 lg:w-12 lg:h-12" /> battery-health.info
        </h1>
        <div className="flex gap-4 items-center">
          <a
            href="https://github.com/landeda/battery-health"
            target="_blank"
            title="Source code"
            aria-label="Source code"
            className={headerRoundButtonClassName}>
            <Github className="w-6 h-6" />
          </a>
          <a
            href="https://www.sciencedirect.com/science/article/pii/S2352152X23037878"
            target="_blank"
            title="Study"
            aria-label="Study"
            className={headerRoundButtonClassName}>
            <Microscope className="w-6 h-6" />
          </a>
          <button
            type="button"
            onClick={openDisclaimerModal}
            aria-label="Disclaimer"
            className={headerRoundButtonClassName}>
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
      <NavigationTabs />
    </header>
  );
};
