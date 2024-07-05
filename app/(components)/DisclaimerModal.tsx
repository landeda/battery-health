'use client';
import { Modal, useModal } from '@/components/Modal';
import { FC, useEffect } from 'react';
import { z } from 'zod';

const DISCLAIMER_LOCAL_STORAGE_KEY = 'disclaimer_shown';

export const DisclaimerModal: FC = () => {
  const { open } = useModal('disclaimer');
  useEffect(() => {
    const value = localStorage.getItem(DISCLAIMER_LOCAL_STORAGE_KEY);
    const result = z.coerce.boolean().safeParse(value);
    if (!result.success || !result.data) {
      localStorage.setItem(DISCLAIMER_LOCAL_STORAGE_KEY, String(true));
      open();
    }
  }, [open]);

  return (
    <Modal modalId="disclaimer" title="Disclaimer">
      <section className="flex flex-col gap-2">
        <p>
          While this web application provides an <strong>approximate</strong> simulation, the
          general output trends should be accurate. Many factors that can impact battery degradation
          are not taken into account, such as:
        </p>
        <ul className="flex flex-col list-disc ml-4 mb-2 gap-1.5">
          <li>
            <strong className="font-semibold">Anode Composition:</strong> Even with the same
            chemistry, each manufacturer uses their own specific formulation.
          </li>
          <li>
            <strong className="font-semibold">Battery Management System (BMS):</strong> The
            effectiveness of the BMS in regulating temperature, State of Charge (SoC), and balancing
            cell voltages impacts battery health.
          </li>
          <li>
            <strong className="font-semibold">Environmental Factors:</strong> Humidity, vibration,
            and exposure to corrosive elements can affect battery longevity.
          </li>
          <li>
            <strong className="font-semibold">Usage Patterns:</strong> The way the battery is used
            (e.g., continuous high power demand vs. intermittent use) affects degradation.
          </li>
          <li>
            <strong className="font-semibold">C-Rate:</strong> The rate at which a battery is
            charged or discharged relative to its capacity. High C-rates can lead to increased
            stress and heat generation.
          </li>
          <li>
            <strong className="font-semibold">And many others...</strong>
          </li>
        </ul>
        <p className="italic text-sm">
          Note that State of Health (SOH) computation varies among manufacturers. Some may use the
          battery buffer to smooth out variations, while others aim to maintain it at 100% for as
          long as possible. The methods for SOH computation are often not disclosed in detail.
        </p>
      </section>
    </Modal>
  );
};
