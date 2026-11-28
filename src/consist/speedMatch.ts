import {SpeedTime} from '../library/types';

// Speed matching for consists, from each loco's time capture (the Traction
// tab, as in Roco's Z21 app): the seconds a loco takes over a fixed stretch
// of track at a speed step. Measured over the same stretch for every loco,
// 1 / seconds compares the locos' real speeds, so each member can be driven
// at the step where it runs as fast as the lead loco.

// Measurements sorted by step, without unusable entries.
const usable = (times: readonly SpeedTime[]): SpeedTime[] =>
  times
    .filter(
      (time) =>
        Number.isFinite(time.step) &&
        time.step > 0 &&
        Number.isFinite(time.seconds) &&
        time.seconds > 0,
    )
    .sort((a, b) => a.step - b.step);

// Whether a loco has measurements to match with.
export const canMatchSpeed = (times: readonly SpeedTime[]): boolean =>
  usable(times).length > 0;

// Relative speed (stretches per second) at a step of the loco's own speed
// steps. Between measurements the speed is interpolated linearly; below the
// first one it rises linearly from standstill; above the last one it grows
// in proportion to the step. 0 at step 0; null without measurements.
export const speedAtStep = (
  times: readonly SpeedTime[],
  step: number,
): number | null => {
  const points = usable(times);
  if (points.length === 0) {
    return null;
  }
  if (step <= 0) {
    return 0;
  }
  let previous = {step: 0, speed: 0};
  for (const point of points) {
    const speed = 1 / point.seconds;
    if (step <= point.step) {
      const share = (step - previous.step) / (point.step - previous.step);
      return previous.speed + share * (speed - previous.speed);
    }
    previous = {step: point.step, speed};
  }
  return (previous.speed * step) / previous.step;
};

// The step (1…maxStep) at which the loco runs closest to `speed`; the lower
// step on a tie. Null without measurements. Searching every step keeps this
// right even when measurements are uneven (a faster time at a lower step).
export const stepForSpeed = (
  times: readonly SpeedTime[],
  speed: number,
  maxStep: number,
): number | null => {
  if (!canMatchSpeed(times)) {
    return null;
  }
  let best = 1;
  let bestDifference = Number.POSITIVE_INFINITY;
  for (let step = 1; step <= maxStep; step++) {
    const difference = Math.abs((speedAtStep(times, step) ?? 0) - speed);
    if (difference < bestDifference) {
      best = step;
      bestDifference = difference;
    }
  }
  return best;
};

// Moves measurements to another speed-step mode (e.g. 128 → 28 steps), so
// they keep describing the same speeds. Steps that land on the same new step
// keep the first measurement.
export const convertSpeedTimes = (
  times: readonly SpeedTime[],
  fromMax: number,
  toMax: number,
): SpeedTime[] => {
  if (fromMax === toMax) {
    return [...times];
  }
  const converted: SpeedTime[] = [];
  for (const time of [...times].sort((a, b) => a.step - b.step)) {
    const step = Math.min(
      toMax,
      Math.max(1, Math.round((time.step * toMax) / fromMax)),
    );
    if (!converted.some((other) => other.step === step)) {
      converted.push({step, seconds: time.seconds});
    }
  }
  return converted;
};
