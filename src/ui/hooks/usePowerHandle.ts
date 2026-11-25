import {useEffect, useRef, useState} from 'react';
import {
  HANDLE_TICK_MS,
  HandleLoco,
  nextHandleSpeed,
} from '../../driving/powerHandle';

type Options = HandleLoco & {
  // The displayed speed step (follows LAN_X_LOCO_INFO).
  speed: number;
  // When another controller last changed the loco's speed or direction.
  foreignDriveAt: number;
  // False while the handle must not move the loco: not connected, or track
  // not in normal operation. The handle stays at coast meanwhile.
  active: boolean;
  // The loco is emergency-stopped. When this turns on, the handle returns
  // to coast; it can be moved again afterwards.
  stopped: boolean;
  // Sends a new speed step.
  drive: (step: number) => void;
};

// Runs the power handle of one throttle. While the handle is off centre, it
// recomputes the speed every HANDLE_TICK_MS and sends the step when it
// changes; at centre nothing runs. Whenever driving is not allowed (STOP,
// track off, short circuit, disconnect) or the loco is stopped, the handle
// returns to coast, so the loco never starts again by itself afterwards.
//
// Once the brake has brought the loco to 0, it is held at 0: if the central
// unit still reports a speed (the last steps were lost on the way), 0 is sent
// again. This ends when the handle is moved to power, or another controller
// drives the loco.
export const usePowerHandle = (options: Options) => {
  const [handle, setHandle] = useState(0);
  const latest = useRef(options);
  latest.current = options;
  const handleRef = useRef(handle);
  handleRef.current = handle;
  const moving = handle !== 0;
  // Set when braking reached 0: the foreignDriveAt value at that moment.
  const brakedToStop = useRef<number | null>(null);

  useEffect(() => {
    if (!options.active || options.stopped) {
      setHandle(0);
    }
  }, [options.active, options.stopped]);

  useEffect(() => {
    if (handle > 0) {
      brakedToStop.current = null;
    }
  }, [handle]);

  // Hold a braked stop: the central unit must report 0 too.
  useEffect(() => {
    const latch = brakedToStop.current;
    if (latch === null) {
      return;
    }
    if (options.foreignDriveAt !== latch) {
      brakedToStop.current = null;
      return;
    }
    if (options.active && !options.stopped && options.speed > 0) {
      latest.current.drive(0);
    }
  }, [options.speed, options.foreignDriveAt, options.active, options.stopped]);

  useEffect(() => {
    if (!moving || !latest.current.active) {
      return;
    }
    // The simulated speed keeps fractions between steps. It follows the
    // displayed speed again if that changes from elsewhere (another
    // controller, or the central unit not taking a step).
    let simulated = latest.current.speed;
    let lastStep = latest.current.speed;
    let lastTime = Date.now();
    const timer = setInterval(() => {
      const current = latest.current;
      const now = Date.now();
      if (current.speed !== lastStep) {
        simulated = current.speed;
      }
      simulated = nextHandleSpeed(
        simulated,
        handleRef.current,
        current,
        now - lastTime,
      );
      lastTime = now;
      const step = Math.round(simulated);
      if (step === 0 && handleRef.current < 0) {
        brakedToStop.current ??= current.foreignDriveAt;
      }
      if (step !== current.speed) {
        current.drive(step);
      }
      lastStep = step;
    }, HANDLE_TICK_MS);
    return () => {
      clearInterval(timer);
    };
  }, [moving, options.active]);

  return {handle, setHandle};
};
