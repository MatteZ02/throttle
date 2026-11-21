import {LocoInfo} from '../protocol';

// Once another controller has changed a loco, the shared-control flag stays
// on for this long after the last such change.
export const SHARED_CONTROL_HOLD_MS = 30000;
// A reported change matching a command this device sent within this time is
// treated as caused by this device (covers intermediate values of a slider
// drag that arrive late).
export const OWN_COMMAND_WINDOW_MS = 3000;

type SentCommand =
  | {kind: 'drive'; speed: number; forward: boolean; at: number}
  | {kind: 'function'; index: number; on: boolean; at: number};

type LocoRecord = {
  previous: LocoInfo | null;
  sent: SentCommand[];
  // The last speed and direction, and each function, this device set. A
  // report showing them is explained however old the command is: the
  // central unit may answer late, a broadcast may be lost, and after a
  // STOP the loco reappears with the speed it had.
  lastDrive: {speed: number; forward: boolean} | null;
  lastFunctions: Map<number, boolean>;
  sharedUntil: number;
  busy: boolean;
};

// Detects whether another controller is also driving a loco (brief §6.3):
// - the busy bit, which the central unit sets only for X-BUS handsets;
// - otherwise, a reported change that no command from this device explains.
// Changes into and out of emergency stop never count: a STOP from any device
// stops every loco, and resuming brings back the speed it had, which is not
// someone else driving this one.
export class SharedControlDetector {
  private readonly records = new Map<number, LocoRecord>();

  noteDrive(address: number, speed: number, forward: boolean, now: number) {
    const record = this.record(address, now);
    record.sent.push({kind: 'drive', speed, forward, at: now});
    record.lastDrive = {speed, forward};
  }

  // A per-loco emergency stop from this device. The central unit may report
  // it as an emergency stop or as speed 0.
  noteEmergencyStop(address: number, forward: boolean, now: number) {
    this.noteDrive(address, 0, forward, now);
  }

  noteFunction(address: number, index: number, on: boolean, now: number) {
    const record = this.record(address, now);
    record.sent.push({kind: 'function', index, on, at: now});
    record.lastFunctions.set(index, on);
  }

  // Returns true if the shared-control state of the loco changed.
  noteReport(report: LocoInfo, now: number): boolean {
    const record = this.record(report.address, now);
    const wasShared = this.isShared(report.address, now);
    const previous = record.previous;
    record.previous = report;
    record.busy = report.busy;
    if (previous !== null && this.hasForeignChange(previous, report, record)) {
      record.sharedUntil = now + SHARED_CONTROL_HOLD_MS;
    }
    return this.isShared(report.address, now) !== wasShared;
  }

  isShared(address: number, now: number): boolean {
    const record = this.records.get(address);
    return record !== undefined && (record.busy || now < record.sharedUntil);
  }

  // When the flag will switch off by itself, or undefined if it will not
  // (off already, or held by the busy bit).
  sharedUntil(address: number): number | undefined {
    const record = this.records.get(address);
    return record === undefined || record.busy ? undefined : record.sharedUntil;
  }

  // Forget a loco, e.g. when it is no longer shown.
  forget(address: number): void {
    this.records.delete(address);
  }

  private record(address: number, now: number): LocoRecord {
    let record = this.records.get(address);
    if (record === undefined) {
      record = {
        previous: null,
        sent: [],
        lastDrive: null,
        lastFunctions: new Map(),
        sharedUntil: 0,
        busy: false,
      };
      this.records.set(address, record);
    }
    record.sent = record.sent.filter(
      (command) => now - command.at <= OWN_COMMAND_WINDOW_MS,
    );
    return record;
  }

  private hasForeignChange(
    previous: LocoInfo,
    next: LocoInfo,
    record: LocoRecord,
  ): boolean {
    const driveChanged =
      previous.speed !== next.speed || previous.forward !== next.forward;
    const stopInvolved = previous.emergencyStop || next.emergencyStop;
    if (driveChanged && !stopInvolved) {
      const matches = (command: {speed: number; forward: boolean} | null) =>
        command !== null &&
        command.speed === next.speed &&
        command.forward === next.forward;
      const explained =
        matches(record.lastDrive) ||
        record.sent.some(
          (command) => command.kind === 'drive' && matches(command),
        );
      if (!explained) {
        return true;
      }
    }
    const count = Math.max(previous.functions.length, next.functions.length);
    for (let index = 0; index < count; index++) {
      const on = next.functions[index] ?? false;
      if ((previous.functions[index] ?? false) === on) {
        continue;
      }
      const explained =
        record.lastFunctions.get(index) === on ||
        record.sent.some(
          (command) =>
            command.kind === 'function' &&
            command.index === index &&
            command.on === on,
        );
      if (!explained) {
        return true;
      }
    }
    return false;
  }
}
