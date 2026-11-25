import {
  BroadcastFlag,
  decodeDatagram,
  lanGetCode,
  lanGetHwInfo,
  lanGetSerialNumber,
  lanLogoff,
  lanSetBroadcastFlags,
  lanSystemStateGetData,
  lanXGetFirmwareVersion,
  lanXGetLocoInfo,
  lanXGetStatus,
  lanXSetLocoDrive,
  lanXSetLocoEStop,
  lanXSetLocoFunction,
  lanXSetStop,
  lanXSetTrackPowerOff,
  lanXSetTrackPowerOn,
  LocoInfo,
  packDatagrams,
  SpeedSteps,
  SystemState,
  toHex,
  versionToNumber,
  Z21_DEFAULT_PORT,
  Z21Message,
} from '../protocol';
import {DriveRequest, DriveThrottle} from './driveThrottle';
import {Listener, TypedEmitter} from './emitter';
import {LocoSubscriptions} from './subscriptions';
import {nextTrackStatus, TrackStatus} from './trackStatus';
import {UdpTransport} from './transport';

// No reply within this time after opening a socket: give up on it and try
// again with a new one.
export const CONNECT_TIMEOUT_MS = 3000;
// While waiting for the first reply, the login is sent again this often: on
// a busy Wi-Fi a single datagram is easily lost.
export const LOGIN_RETRY_MS = 1000;
// LAN_GET_HWINFO unanswered after this time: fall back to
// LAN_X_GET_FIRMWARE_VERSION.
export const DEVICE_INFO_TIMEOUT_MS = 2000;
// How often the connection checks its timers below. Sends nothing by itself.
export const LIVENESS_CHECK_INTERVAL_MS = 1000;
// LAN_X_GET_STATUS when the track status has not been heard for this long.
// Track status broadcasts are UDP and can be lost on a busy Wi-Fi; this
// bounds how long a missed STOP, power off or short circuit can go unseen.
// It is also the keepalive (the Z21 drops clients after 60 s of silence,
// §1.1). One small request and reply per device.
export const STATUS_CHECK_INTERVAL_MS = 3000;
// Nothing received for this long (two status checks unanswered): the link is
// weak. The controls stay usable and commands are still sent.
export const WEAK_AFTER_MS = 7000;
// Nothing received for this long: the connection is lost, and the app
// reconnects with a new socket.
export const CONNECTION_LOST_AFTER_MS = 20000;
// Delay before each reconnect attempt; the last value repeats. Short on
// purpose: an attempt is one small datagram per second.
export const RECONNECT_DELAYS_MS = [500, 1000, 2000];
// A STOP or track power command not confirmed by the track status within
// this time is sent again (power on: only the status is asked for), at most
// TRACK_COMMAND_ATTEMPTS times in all.
export const TRACK_CONFIRM_MS = 500;
export const TRACK_COMMAND_ATTEMPTS = 3;
// LAN_X_SET_LOCO_E_STOP exists from Z21 FW 1.43 (§4.5).
const LOCO_E_STOP_MIN_FIRMWARE = 143;

export type ConnectionState =
  'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export type DeviceInfo = {
  hardwareType?: number;
  firmwareVersion?: string;
  serialNumber?: number;
  // LAN_GET_CODE: 0 = no lock, 1 = z21 start locked, 2 = unlocked.
  lockCode?: number;
};

export type ProtocolLogEntry = {
  time: number;
  direction: 'out' | 'in' | 'info';
  text: string;
};

export type ConnectionEvents = {
  state: ConnectionState;
  // Connected, but nothing has been received for WEAK_AFTER_MS.
  linkWeak: boolean;
  trackStatus: TrackStatus;
  locoInfo: LocoInfo;
  deviceInfo: DeviceInfo;
  systemState: SystemState;
  // A watched loco was pushed out of the central unit's 16-loco subscription
  // list; it no longer gets live updates.
  subscriptionEvicted: number;
  log: ProtocolLogEntry;
};

export type ConnectionOptions = {
  createTransport: () => UdpTransport;
  broadcastFlags?: number;
  // Pack several datasets into one UDP datagram (§1.3). Can be turned off if
  // a central unit turns out not to handle combined datasets.
  combineDatasets?: boolean;
};

export type LocoStopTarget = {
  address: number;
  steps: SpeedSteps;
  forward: boolean;
};

// Owns the single UDP socket to the central unit and everything that happens
// on it: connecting, keepalive, reconnecting, logoff, loco subscriptions and
// drive-command throttling.
export class ConnectionManager {
  private readonly events = new TypedEmitter<ConnectionEvents>();
  private readonly subscriptions = new LocoSubscriptions();
  private readonly throttle: DriveThrottle;
  private readonly createTransport: () => UdpTransport;
  private readonly broadcastFlags: number;
  private readonly combineDatasets: boolean;

  private host = '';
  private port = Z21_DEFAULT_PORT;
  private wantConnected = false;
  private suspended = false;
  private state: ConnectionState = 'disconnected';
  private transport: UdpTransport | null = null;
  // Incremented whenever a socket is abandoned, so late callbacks from it are
  // ignored.
  private generation = 0;
  private reconnectAttempt = 0;

  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private loginTimer: ReturnType<typeof setTimeout> | null = null;
  private deviceInfoTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private trackTimer: ReturnType<typeof setTimeout> | null = null;
  private livenessTimer: ReturnType<typeof setInterval> | null = null;

  private lastReceivedAt = 0;
  private lastStatusAt = 0;
  private lastStatusRequestAt = 0;
  private linkWeak = false;
  // The last STOP or track power command, until the track status confirms it.
  private trackCommand: {
    command: Uint8Array;
    expected: TrackStatus[];
    resend: boolean;
    attempts: number;
  } | null = null;

  private deviceInfo: DeviceInfo = {};
  private trackStatus: TrackStatus = 'unknown';
  private loggingEnabled = false;

  constructor(options: ConnectionOptions) {
    this.createTransport = options.createTransport;
    this.broadcastFlags = options.broadcastFlags ?? BroadcastFlag.BASIC;
    this.combineDatasets = options.combineDatasets ?? true;
    this.throttle = new DriveThrottle((datasets) => {
      this.send(datasets);
    });
  }

  on<K extends keyof ConnectionEvents>(
    event: K,
    listener: Listener<ConnectionEvents[K]>,
  ): () => void {
    return this.events.on(event, listener);
  }

  getState(): ConnectionState {
    return this.state;
  }

  getTrackStatus(): TrackStatus {
    return this.trackStatus;
  }

  isLinkWeak(): boolean {
    return this.linkWeak;
  }

  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  setLogging(enabled: boolean): void {
    this.loggingEnabled = enabled;
  }

  // Connects (or reconnects to a new address). Retries with backoff until
  // disconnect() is called.
  connect(host: string, port: number = Z21_DEFAULT_PORT): void {
    this.closeSocket(true);
    this.clearReconnectTimer();
    this.host = host;
    this.port = port;
    this.wantConnected = true;
    this.reconnectAttempt = 0;
    this.startSocket();
  }

  // Logs off and closes the socket. Watched locos are remembered and
  // re-subscribed on the next connect().
  disconnect(): void {
    this.suspended = false;
    this.wantConnected = false;
    this.clearReconnectTimer();
    this.closeSocket(true);
    this.setState('disconnected');
  }

  // App went to the background: log off and close the socket (brief §5).
  // Does nothing if not connected or connecting.
  suspend(): void {
    if (!this.wantConnected) {
      return;
    }
    this.disconnect();
    this.suspended = true;
  }

  // App came back to the foreground: reconnect if suspend() disconnected us.
  // Reconnecting restores broadcast flags, track status and subscriptions.
  resume(): void {
    if (this.suspended) {
      this.suspended = false;
      this.connect(this.host, this.port);
    }
  }

  // Stops everything; the manager cannot be used afterwards.
  dispose(): void {
    this.disconnect();
    this.events.removeAll();
  }

  // --- Commands -----------------------------------------------------------

  // Power off goes out like STOP (see emergencyStop). Power on only while
  // connected; if it is not confirmed, the status is asked for, but the
  // command is not repeated: a short circuit that is still there would only
  // trip again.
  setTrackPower(on: boolean): void {
    if (on) {
      if (this.state === 'connected') {
        this.sendTrackCommand(lanXSetTrackPowerOn(), ['normal'], false);
      } else {
        this.log('info', 'Not connected; command dropped');
      }
    } else {
      this.throttle.cancelAll();
      this.sendTrackCommand(
        lanXSetTrackPowerOff(),
        ['powerOff', 'shortCircuit'],
        true,
      );
    }
  }

  // Global emergency stop: all locos stop, track power stays on. Pending
  // drive commands are discarded so nothing restarts a loco afterwards. Sent
  // even while reconnecting, if a socket is open: a STOP that may arrive is
  // better than none. Repeated until the track status confirms it.
  emergencyStop(): void {
    this.throttle.cancelAll();
    this.sendTrackCommand(
      lanXSetStop(),
      ['emergencyStop', 'powerOff', 'shortCircuit'],
      true,
    );
  }

  // Emergency stop for individual locos (all members of a consist at once).
  // Sends the drive command with the E-Stop speed value, which every central
  // unit supports. On FW 1.43+ LAN_X_SET_LOCO_E_STOP goes out as well: a unit
  // may ignore it (the Z21Sim simulator does), so it is never sent alone.
  // Decided by the user.
  emergencyStopLocos(targets: LocoStopTarget[]): void {
    const useLocoEStop =
      versionToNumber(this.deviceInfo.firmwareVersion ?? '') >=
      LOCO_E_STOP_MIN_FIRMWARE;
    const datasets = targets.flatMap((target) => {
      this.throttle.cancel(target.address);
      const driveEStop = lanXSetLocoDrive({
        ...target,
        speed: 0,
        emergencyStop: true,
      });
      return useLocoEStop
        ? [lanXSetLocoEStop(target.address), driveEStop]
        : [driveEStop];
    });
    // Then ask for the result in the same datagram: not every central unit
    // reports it on its own, and one that ignores the command must not leave
    // the screen showing a stop that did not happen.
    const watched = targets
      .map((target) => target.address)
      .filter((address) => this.subscriptions.isWatched(address));
    this.send([...datasets, ...this.locoInfoRequests(watched)]);
  }

  // Throttled; see DriveThrottle.
  drive(request: DriveRequest): void {
    this.throttle.set(request);
  }

  // Sends a drive command again at once, with a request for the loco's state
  // in the same datagram: for a command the central unit has not confirmed
  // (the command or its reply was lost). Not throttled and not skipped when
  // unchanged, because "unchanged" may rest on the lost command.
  resendDrive(request: DriveRequest): void {
    this.throttle.cancel(request.address);
    const drive = lanXSetLocoDrive({...request, emergencyStop: false});
    const info = this.subscriptions.isWatched(request.address)
      ? this.locoInfoRequests([request.address])
      : [];
    this.send([drive, ...info]);
  }

  setFunction(address: number, index: number, on: boolean): void {
    this.send([lanXSetLocoFunction(address, index, on ? 'on' : 'off')]);
  }

  requestStatus(): void {
    this.send([lanXGetStatus()]);
  }

  requestSystemState(): void {
    this.send([lanSystemStateGetData()]);
  }

  // Subscribes to live info for locos shown on screen. Returns a function
  // that ends this watch. Several watchers of one address are counted.
  watchLocos(addresses: number[]): () => void {
    const newlyWatched = addresses.filter((address) =>
      this.subscriptions.watch(address),
    );
    if (this.state === 'connected') {
      this.requestLocoInfo(newlyWatched);
    }
    let active = true;
    return () => {
      if (active) {
        active = false;
        addresses.forEach((address) => {
          this.subscriptions.unwatch(address);
        });
      }
    };
  }

  // --- Connection lifecycle -------------------------------------------------

  private startSocket(): void {
    // openSocket handles its own errors; this only catches the unexpected.
    this.openSocket().catch((error: unknown) => {
      this.log('info', `Unexpected connection error: ${String(error)}`);
    });
  }

  private async openSocket(): Promise<void> {
    const generation = ++this.generation;
    this.setState(this.reconnectAttempt === 0 ? 'connecting' : 'reconnecting');
    this.deviceInfo = {};
    this.log('info', `Connecting to ${this.host}:${this.port}`);

    const transport = this.createTransport();
    try {
      await transport.open(this.host, this.port, {
        onMessage: (data) => {
          if (generation === this.generation) {
            this.handleDatagram(data);
          }
        },
        onError: (message) => {
          if (generation === this.generation) {
            this.log('info', `Socket error: ${message}`);
          }
        },
      });
    } catch (error) {
      if (generation === this.generation) {
        this.log('info', `Could not open socket: ${String(error)}`);
        this.scheduleReconnect();
      }
      return;
    }

    if (generation !== this.generation) {
      transport.close();
      return;
    }
    this.transport = transport;
    this.sendLogin();
    this.connectTimer = setTimeout(() => {
      this.log('info', 'No reply from central unit');
      this.closeSocket(true);
      this.scheduleReconnect();
    }, CONNECT_TIMEOUT_MS);
  }

  // Login is implicit with the first command (§2.2). Flags must be set again
  // on every login (§2.16). Repeated until the first reply.
  private sendLogin(): void {
    this.sendNow([lanSetBroadcastFlags(this.broadcastFlags), lanXGetStatus()]);
    this.lastStatusRequestAt = Date.now();
    this.loginTimer = setTimeout(() => {
      this.loginTimer = null;
      this.sendLogin();
    }, LOGIN_RETRY_MS);
  }

  private onConnected(): void {
    this.clearTimer('connectTimer');
    this.clearTimer('loginTimer');
    this.reconnectAttempt = 0;
    this.lastStatusAt = Date.now();
    this.setState('connected');

    // Optional requests; the app works without the replies.
    this.sendNow([lanGetHwInfo(), lanGetCode(), lanGetSerialNumber()]);
    this.deviceInfoTimer = setTimeout(() => {
      if (this.deviceInfo.firmwareVersion === undefined) {
        this.sendNow([lanXGetFirmwareVersion()]);
      }
    }, DEVICE_INFO_TIMEOUT_MS);

    this.requestLocoInfo(this.subscriptions.watchedAddresses());

    this.livenessTimer = setInterval(() => {
      this.checkLiveness();
    }, LIVENESS_CHECK_INTERVAL_MS);
  }

  // A weak link (lost datagrams) is not a lost connection: the controls stay
  // usable and everything is still sent. Only a long silence counts as lost.
  private checkLiveness(): void {
    const now = Date.now();
    const silence = now - this.lastReceivedAt;
    if (silence >= CONNECTION_LOST_AFTER_MS) {
      this.log('info', 'Connection lost');
      this.closeSocket(true);
      this.scheduleReconnect();
      return;
    }
    this.setLinkWeak(silence >= WEAK_AFTER_MS);
    if (
      now - this.lastStatusAt >= STATUS_CHECK_INTERVAL_MS &&
      now - this.lastStatusRequestAt >= STATUS_CHECK_INTERVAL_MS
    ) {
      this.lastStatusRequestAt = now;
      this.sendNow([lanXGetStatus()]);
    }
  }

  private scheduleReconnect(): void {
    if (!this.wantConnected) {
      return;
    }
    const delay =
      RECONNECT_DELAYS_MS[
        Math.min(this.reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)
      ];
    this.reconnectAttempt++;
    this.setState('reconnecting');
    this.log('info', `Retrying in ${delay / 1000} s`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.startSocket();
    }, delay);
  }

  // With sendLogoff, LAN_LOGOFF goes out first (best effort), also on a
  // socket that got no reply: the central unit may have heard the login, and
  // a logoff frees its client slot at once instead of after 60 s.
  private closeSocket(sendLogoff: boolean): void {
    this.generation++;
    this.clearTimer('connectTimer');
    this.clearTimer('loginTimer');
    this.clearTimer('deviceInfoTimer');
    this.clearTimer('trackTimer');
    this.trackCommand = null;
    if (this.livenessTimer !== null) {
      clearInterval(this.livenessTimer);
      this.livenessTimer = null;
    }
    this.setLinkWeak(false);
    this.throttle.reset();
    this.subscriptions.resetSubscribed();

    if (this.transport) {
      if (sendLogoff) {
        this.sendNow([lanLogoff()]);
      }
      this.transport.close();
      this.transport = null;
    }
  }

  private clearReconnectTimer(): void {
    this.clearTimer('reconnectTimer');
  }

  private clearTimer(
    name:
      | 'connectTimer'
      | 'loginTimer'
      | 'deviceInfoTimer'
      | 'reconnectTimer'
      | 'trackTimer',
  ): void {
    const timer = this[name];
    if (timer !== null) {
      clearTimeout(timer);
      this[name] = null;
    }
  }

  // --- Receiving ------------------------------------------------------------

  private handleDatagram(data: Uint8Array): void {
    this.lastReceivedAt = Date.now();
    this.setLinkWeak(false);
    const messages = decodeDatagram(data);
    if (this.loggingEnabled) {
      const types = messages.map((message) => message.type).join(', ');
      this.log('in', `${toHex(data)}  (${types})`);
    }
    if (this.state !== 'connected') {
      this.onConnected();
    }
    messages.forEach((message) => {
      this.handleMessage(message);
    });
  }

  private handleMessage(message: Z21Message): void {
    const trackStatus = nextTrackStatus(this.trackStatus, message);
    if (trackStatus !== undefined) {
      this.lastStatusAt = Date.now();
    }
    const trackStatusChanged =
      trackStatus !== undefined && trackStatus !== this.trackStatus;
    if (trackStatusChanged) {
      this.trackStatus = trackStatus;
      this.events.emit('trackStatus', trackStatus);
    }
    if (this.trackCommand?.expected.includes(this.trackStatus)) {
      this.trackCommand = null;
      this.clearTimer('trackTimer');
    }

    switch (message.type) {
      case 'locoInfo':
        this.throttle.noteReported(message.loco);
        this.events.emit('locoInfo', message.loco);
        break;
      case 'stopped':
      case 'trackPowerOn':
      case 'trackPowerOff':
      case 'shortCircuit':
        // The spec does not say whether the central unit reports loco state
        // after these (the Z21Sim simulator does not, and keeps the old
        // speeds). Ask, so the screen shows what the central unit holds.
        // Only on a real change: a repeated broadcast (or one sent along
        // with every reply) must never start a request loop.
        if (trackStatusChanged) {
          this.requestLocoInfo(this.subscriptions.watchedAddresses());
        }
        break;
      case 'systemState':
        this.events.emit('systemState', message.systemState);
        break;
      case 'hwInfo':
        this.updateDeviceInfo({
          hardwareType: message.hardwareType,
          firmwareVersion: message.firmwareVersion,
        });
        break;
      case 'firmwareVersion':
        if (this.deviceInfo.firmwareVersion === undefined) {
          this.updateDeviceInfo({firmwareVersion: message.firmwareVersion});
        }
        break;
      case 'code':
        this.updateDeviceInfo({lockCode: message.code});
        break;
      case 'serialNumber':
        this.updateDeviceInfo({serialNumber: message.serialNumber});
        break;
    }
  }

  private updateDeviceInfo(update: DeviceInfo): void {
    this.deviceInfo = {...this.deviceInfo, ...update};
    this.events.emit('deviceInfo', this.deviceInfo);
  }

  // --- Sending --------------------------------------------------------------

  private requestLocoInfo(addresses: number[]): void {
    if (addresses.length > 0) {
      this.send(this.locoInfoRequests(addresses));
    }
  }

  // LAN_X_GET_LOCO_INFO datasets, with the subscription FIFO kept up to date.
  private locoInfoRequests(addresses: number[]): Uint8Array[] {
    return addresses.map((address) => {
      const evicted = this.subscriptions.recordRequest(address);
      evicted
        .filter((dropped) => this.subscriptions.isWatched(dropped))
        .forEach((dropped) => {
          this.events.emit('subscriptionEvicted', dropped);
        });
      return lanXGetLocoInfo(address);
    });
  }

  // A STOP or track power command, repeated (or followed by a status
  // request) until the track status confirms it. A newer command replaces an
  // older one. Goes out on any open socket, also while reconnecting.
  private sendTrackCommand(
    command: Uint8Array,
    expected: TrackStatus[],
    resend: boolean,
  ): void {
    this.clearTimer('trackTimer');
    this.trackCommand = null;
    if (this.transport === null) {
      this.log('info', 'Not connected; command dropped');
      return;
    }
    this.trackCommand = {command, expected, resend, attempts: 1};
    this.sendNow([command]);
    this.scheduleTrackCheck();
  }

  private scheduleTrackCheck(): void {
    this.trackTimer = setTimeout(() => {
      this.trackTimer = null;
      const pending = this.trackCommand;
      if (pending === null || pending.expected.includes(this.trackStatus)) {
        this.trackCommand = null;
        return;
      }
      if (pending.attempts >= TRACK_COMMAND_ATTEMPTS) {
        this.log('info', 'Track command not confirmed');
        this.trackCommand = null;
        return;
      }
      pending.attempts++;
      this.lastStatusRequestAt = Date.now();
      this.sendNow(
        pending.resend ? [pending.command, lanXGetStatus()] : [lanXGetStatus()],
      );
      this.scheduleTrackCheck();
    }, TRACK_CONFIRM_MS);
  }

  // Sends only while connected; commands issued while offline are dropped,
  // because replaying stale driving commands later would be unsafe.
  private send(datasets: Uint8Array[]): void {
    if (this.state !== 'connected') {
      this.log('info', 'Not connected; command dropped');
      return;
    }
    this.sendNow(datasets);
  }

  private sendNow(datasets: Uint8Array[]): void {
    const transport = this.transport;
    if (!transport || datasets.length === 0) {
      return;
    }
    const datagrams = this.combineDatasets ? packDatagrams(datasets) : datasets;
    for (const datagram of datagrams) {
      transport.send(datagram);
      if (this.loggingEnabled) {
        this.log('out', toHex(datagram));
      }
    }
  }

  private setLinkWeak(weak: boolean): void {
    if (weak !== this.linkWeak) {
      this.linkWeak = weak;
      this.log('info', weak ? 'Link weak: no replies' : 'Link ok');
      this.events.emit('linkWeak', weak);
    }
  }

  private setState(state: ConnectionState): void {
    if (state !== this.state) {
      this.state = state;
      if (state !== 'connected' && this.trackStatus !== 'unknown') {
        this.trackStatus = 'unknown';
        this.events.emit('trackStatus', 'unknown');
      }
      this.events.emit('state', state);
    }
  }

  private log(direction: ProtocolLogEntry['direction'], text: string): void {
    if (this.loggingEnabled) {
      this.events.emit('log', {time: Date.now(), direction, text});
    }
  }
}
