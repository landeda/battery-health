export type ChemistryProperties = {
  kSoc: (soc: number) => number;
  a0: number;
  b: number;
};

export type Chemistry = 'LFP' | 'LMO-NMC';

export const CHEMISTRIES_PROPERTIES: Record<Chemistry, ChemistryProperties> = {
  LFP: {
    kSoc: (soc) => 1.14e-6 * Math.pow(soc, 3) - 0.000215 * Math.pow(soc, 2) + 0.0137 * soc + 0.281,
    a0: 8.856e-4,
    b: 0.0266,
  },
  'LMO-NMC': {
    kSoc: (soc) => -2.67e-5 * Math.pow(soc, 2) + 0.00793 * soc + 0.301,
    a0: 1.4565e-4,
    b: 0.0741,
  },
};
