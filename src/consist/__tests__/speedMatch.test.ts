import {memberDrive, MemberDriveInput} from '../consistMath';
import {
  canMatchSpeed,
  convertSpeedTimes,
  speedAtStep,
  stepForSpeed,
} from '../speedMatch';

// The time capture of the two Vectrons in the user's Roco export
// ("Double vectron"; vehicles_traction_phone.PNG shows the first).
const LUGANO = [
  {step: 10, seconds: 80.3},
  {step: 20, seconds: 40.24},
  {step: 30, seconds: 27.07},
  {step: 40, seconds: 19.49},
  {step: 50, seconds: 15.58},
  {step: 60, seconds: 12.99},
  {step: 70, seconds: 10.16},
  {step: 80, seconds: 7.83},
  {step: 90, seconds: 6.56},
  {step: 100, seconds: 6.02},
  {step: 110, seconds: 5.0},
];
const PIERCER = [
  {step: 20, seconds: 60.0},
  {step: 30, seconds: 38.09},
  {step: 40, seconds: 25.27},
  {step: 50, seconds: 18.17},
  {step: 60, seconds: 13.34},
  {step: 70, seconds: 10.43},
  {step: 80, seconds: 8.43},
  {step: 90, seconds: 6.99},
  {step: 100, seconds: 6.02},
  {step: 110, seconds: 5.06},
];

const loco = (
  speedTimes: MemberDriveInput['speedTimes'],
  speedSteps: 14 | 28 | 128 = 128,
  speedOffset = 0,
): MemberDriveInput => ({
  speedSteps,
  speedOffset,
  reversed: false,
  speedTimes,
});

describe('speed from the time capture', () => {
  it('is 1 / seconds at a measured step', () => {
    expect(speedAtStep(LUGANO, 20)).toBeCloseTo(1 / 40.24);
  });

  it('interpolates between measurements', () => {
    const halfway = (1 / 40.24 + 1 / 27.07) / 2;
    expect(speedAtStep(LUGANO, 25)).toBeCloseTo(halfway);
  });

  it('rises from standstill below the first measurement', () => {
    expect(speedAtStep(PIERCER, 0)).toBe(0);
    expect(speedAtStep(PIERCER, 10)).toBeCloseTo(1 / 60 / 2);
  });

  it('grows in proportion above the last measurement', () => {
    expect(speedAtStep(LUGANO, 126)).toBeCloseTo((1 / 5) * (126 / 110));
  });

  it('needs at least one usable measurement', () => {
    expect(speedAtStep([], 50)).toBeNull();
    expect(canMatchSpeed([{step: 10, seconds: 0}])).toBe(false);
    expect(canMatchSpeed([{step: 10, seconds: 12}])).toBe(true);
  });
});

describe('matching steps', () => {
  it('finds the step with the closest speed', () => {
    // The Piercer is slower low down: at step 20 it needs 60 s where the
    // Lugano needs 40.24 s, so it runs at a higher step.
    const target = speedAtStep(LUGANO, 20) ?? 0;
    const step = stepForSpeed(PIERCER, target, 126) ?? 0;
    expect(step).toBeGreaterThan(20);
    expect(step).toBeLessThan(30);
  });

  it('gives the same step for the same loco', () => {
    for (const step of [10, 33, 70, 126]) {
      expect(stepForSpeed(LUGANO, speedAtStep(LUGANO, step) ?? 0, 126)).toBe(
        step,
      );
    }
  });

  it('works in the member’s own speed steps', () => {
    const in28 = convertSpeedTimes(PIERCER, 126, 28);
    const target = speedAtStep(LUGANO, 63) ?? 0;
    const step = stepForSpeed(in28, target, 28) ?? 0;
    expect(step).toBeGreaterThanOrEqual(1);
    expect(step).toBeLessThanOrEqual(28);
  });
});

describe('consist members with time capture', () => {
  const lead = loco(LUGANO);

  it('drives the member at the step matching the lead', () => {
    const drive = memberDrive(20, true, loco(PIERCER), lead);
    const expected = stepForSpeed(PIERCER, speedAtStep(LUGANO, 20) ?? 0, 126);
    expect(drive).toEqual({speed: expected, forward: true});
    expect(drive.speed).toBeGreaterThan(20);
  });

  it('matches the lead’s step including its offset', () => {
    const fasterLead = loco(LUGANO, 128, 10);
    const drive = memberDrive(50, true, loco(LUGANO), fasterLead);
    expect(drive.speed).toBe(60);
  });

  it('adds the member’s own offset on top', () => {
    const matched = memberDrive(50, true, loco(PIERCER), lead).speed;
    expect(memberDrive(50, true, loco(PIERCER, 128, 3), lead).speed).toBe(
      matched + 3,
    );
  });

  it('keeps the safety rules', () => {
    // Standing consist: every member stands, whatever the measurements.
    expect(memberDrive(0, true, loco(PIERCER, 128, 5), lead).speed).toBe(0);
    // Moving consist: a member never stops.
    const tiny = memberDrive(1, true, loco(PIERCER, 128, -30), lead);
    expect(tiny.speed).toBeGreaterThanOrEqual(1);
    // Never above the member's top step.
    expect(memberDrive(126, true, loco(PIERCER, 128, 30), lead).speed).toBe(
      126,
    );
  });

  it('falls back to plain scaling without measurements', () => {
    expect(memberDrive(40, true, loco([]), lead).speed).toBe(40);
    expect(memberDrive(40, true, loco(PIERCER), loco([])).speed).toBe(40);
    expect(memberDrive(40, true, loco(PIERCER)).speed).toBe(40);
  });
});

describe('changing speed-step mode', () => {
  it('moves steps to the new scale and drops clashes', () => {
    expect(
      convertSpeedTimes(
        [
          {step: 63, seconds: 20},
          {step: 64, seconds: 19},
          {step: 126, seconds: 10},
        ],
        126,
        28,
      ),
    ).toEqual([
      {step: 14, seconds: 20},
      {step: 28, seconds: 10},
    ]);
  });
});
