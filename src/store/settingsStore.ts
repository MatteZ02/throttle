import type {SQLiteStorage} from 'expo-sqlite/kv-store';
import {create} from 'zustand';
import {createJSONStorage, persist, StateStorage} from 'zustand/middleware';
import {
  DEFAULT_LINK_SETTINGS,
  LinkSettings,
  normalizeLinkSettings,
  normalizeRememberedLines,
  RememberedLine,
} from '../driverLink/linkSettings';
import {DEFAULT_STOP_MODE, StopMode} from '../driving/globalStop';
import {withoutRecent, withRecent} from '../library/recent';
import {VehicleRef} from '../library/types';
import {SpeedSteps, Z21_DEFAULT_PORT} from '../protocol';
import {LanguageSetting} from '../strings';
import {
  DEFAULT_THROTTLES,
  migrateSettings,
  ThrottleIndex,
  selectionFor,
  ThrottleSelection,
  withoutVehicle,
  withSelection,
} from './throttleSelection';

// Brief §6.1.
export const DEFAULT_HOST = '192.168.0.111';

export type Settings = {
  host: string;
  port: number;
  stopMode: StopMode;
  // What each throttle drives (index: ThrottleIndex).
  throttles: ThrottleSelection[];
  // Locos and consists driven recently, latest first (quick-switch strip).
  recent: VehicleRef[];
  // What the strip below the throttle shows.
  vehicleBar: VehicleBarMode;
  // What the throttle slider does.
  driveMode: DriveMode;
  // 'system' follows the phone; unsupported languages fall back to English.
  language: LanguageSetting;
  // Driver link (docs/driver-link.md). Added after settings version 3
  // without a version bump: new keys only, each with a default, so older
  // saved settings load unchanged and older app versions keep these keys.
  // The phone's id on the link, generated once ('' until then).
  deviceId: string;
  link: LinkSettings;
  // Last line per project and vehicle; see rememberedLineKey().
  rememberedLines: Record<string, RememberedLine>;
};

// 'recent': recently driven, latest first. 'all': the whole vehicle list in
// its own order (Vehicles → Arrange), top of the list leftmost. The default
// is 'all', as in Roco's Z21 app.
export type VehicleBarMode = 'recent' | 'all';
export const VEHICLE_BAR_MODES: VehicleBarMode[] = ['recent', 'all'];

// 'speed': the slider sets the speed (the default). 'powerHandle': the slider
// is a power/brake handle; see src/driving/powerHandle.ts.
export type DriveMode = 'speed' | 'powerHandle';
export const DRIVE_MODES: DriveMode[] = ['speed', 'powerHandle'];

type SettingsStore = Settings & {
  update: (changes: Partial<Settings>) => void;
};

type KeyValueStorage = Pick<
  SQLiteStorage,
  'getItemSync' | 'setItemSync' | 'removeItemSync'
>;

let backing: KeyValueStorage | null | undefined;

// Loaded on first use, not imported at the top: if the native SQLite module
// fails, the app must still start (the STOP button lives in it), only without
// remembering settings.
const getBacking = (): KeyValueStorage | null => {
  if (backing === undefined) {
    try {
      const kvStore = require('expo-sqlite/kv-store') as {
        default: KeyValueStorage;
      };
      backing = kvStore.default;
    } catch (error) {
      console.warn(
        'Settings storage unavailable; settings are not saved',
        error,
      );
      backing = null;
    }
  }
  return backing;
};

// Synchronous storage: settings are loaded before the first render, so the
// app can connect at start-up without waiting.
const storage: StateStorage = {
  getItem: (name) => getBacking()?.getItemSync(name) ?? null,
  setItem: (name, value) => {
    getBacking()?.setItemSync(name, value);
  },
  removeItem: (name) => {
    getBacking()?.removeItemSync(name);
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      host: DEFAULT_HOST,
      port: Z21_DEFAULT_PORT,
      stopMode: DEFAULT_STOP_MODE,
      throttles: DEFAULT_THROTTLES,
      recent: [],
      vehicleBar: 'all',
      driveMode: 'speed',
      language: 'system',
      deviceId: '',
      link: DEFAULT_LINK_SETTINGS,
      rememberedLines: {},
      update: (changes) => {
        set(changes);
      },
    }),
    {
      name: 'settings',
      version: 3,
      storage: createJSONStorage(() => storage),
      partialize: ({update: _update, ...settings}) => settings,
      migrate: (persisted, version) =>
        migrateSettings(persisted, version) as unknown as SettingsStore,
      merge: mergeSettings,
    },
  ),
);

// Saved settings over the defaults. As persist's default (a shallow merge),
// except that the driver link's keys are validated: they are newer than the
// rest, so they may be missing or come from a newer version.
export function mergeSettings(
  persisted: unknown,
  current: SettingsStore,
): SettingsStore {
  const saved = (
    typeof persisted === 'object' && persisted !== null ? persisted : {}
  ) as Partial<Settings> & Record<string, unknown>;
  return {
    ...current,
    ...saved,
    deviceId: typeof saved.deviceId === 'string' ? saved.deviceId : '',
    link: normalizeLinkSettings(saved.link),
    rememberedLines: normalizeRememberedLines(saved.rememberedLines),
  };
}

// One constant object, so the selector result stays stable between renders.
const NO_SELECTION: ThrottleSelection = {kind: 'none'};

export const useThrottleSelection = (index: ThrottleIndex): ThrottleSelection =>
  useSettingsStore((state) => state.throttles[index] ?? NO_SELECTION);

// Puts a library loco or consist on a throttle and remembers it as
// recently driven.
export const chooseVehicleToDrive = (
  index: ThrottleIndex,
  ref: VehicleRef,
): void => {
  const settings = useSettingsStore.getState();
  settings.update({
    throttles: withSelection(settings.throttles, index, selectionFor(ref)),
    recent: withRecent(settings.recent, ref),
  });
};

// Puts a plain address (not in the library) on a throttle.
export const chooseAddressToDrive = (
  index: ThrottleIndex,
  address: number,
  speedSteps: SpeedSteps,
): void => {
  const settings = useSettingsStore.getState();
  settings.update({
    throttles: withSelection(settings.throttles, index, {
      kind: 'address',
      address,
      speedSteps,
    }),
  });
};

// Forgets a deleted loco or consist everywhere in the settings.
export const forgetVehicle = (ref: VehicleRef): void => {
  const settings = useSettingsStore.getState();
  settings.update({
    throttles: withoutVehicle(settings.throttles, ref),
    recent: withoutRecent(settings.recent, ref),
  });
};
