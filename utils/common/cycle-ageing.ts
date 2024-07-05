export const getCycleDegradation = (cycleCount: number) => {
  return 100 * (1 - Math.pow(0.8, 1 / cycleCount));
};

export const getCyclingDegradation = (singleCycleDegradation: number, cycleCount: number) => {
  return 1 - Math.pow(1 - singleCycleDegradation / 100, cycleCount);
};
