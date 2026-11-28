import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {DEFAULT_LINK_SETTINGS} from '../../driverLink/linkSettings';
import {memory} from '../testUtils/memoryKvStore';

jest.mock('expo-sqlite/kv-store', () =>
  jest.requireActual('../testUtils/memoryKvStore'),
);

// Settings exactly as release (0.2.6, settings version 3) saves them, with
// non-default values so any change shows.
const RELEASE_STATE = {
  host: '192.168.0.112',
  port: 21105,
  stopMode: 'emergencyStopThenPowerOff',
  throttles: [
    {kind: 'consist', consistId: 2},
    {kind: 'address', address: 44, speedSteps: 28},
  ],
  recent: [
    {kind: 'consist', id: 2},
    {kind: 'loco', id: 7},
  ],
  vehicleBar: 'recent',
  driveMode: 'powerHandle',
  language: 'fi',
};
const RELEASE_JSON = JSON.stringify({state: RELEASE_STATE, version: 3});

// A fresh settings store reading what is in `memory` now.
const loadStore = () => {
  let store!: typeof import('../settingsStore').useSettingsStore;
  jest.isolateModules(() => {
    store = (require('../settingsStore') as typeof import('../settingsStore'))
      .useSettingsStore;
  });
  return store;
};

const saved = () =>
  JSON.parse(memory.get('settings') ?? '{}') as {
    state: Record<string, unknown>;
    version: number;
  };

beforeEach(() => {
  memory.clear();
});

describe('settings saved by release', () => {
  it('load unchanged, with the driver link off', () => {
    memory.set('settings', RELEASE_JSON);
    const state = loadStore().getState();
    expect(state).toMatchObject(RELEASE_STATE);
    expect(state.link).toEqual(DEFAULT_LINK_SETTINGS);
    expect(state.deviceId).toBe('');
    expect(state.rememberedLines).toEqual({});
  });

  it('are saved again with the same keys and version, plus the new ones', () => {
    memory.set('settings', RELEASE_JSON);
    loadStore().getState().update({deviceId: 'thr-1-0123456789ab'});
    const {state, version} = saved();
    expect(version).toBe(3);
    expect(state).toMatchObject(RELEASE_STATE);
    expect(state.deviceId).toBe('thr-1-0123456789ab');
    expect(state.link).toEqual(DEFAULT_LINK_SETTINGS);
  });
});

describe('settings saved by this version', () => {
  it('still load in release, which keeps the link settings', () => {
    memory.set('settings', RELEASE_JSON);
    loadStore()
      .getState()
      .update({
        link: {...DEFAULT_LINK_SETTINGS, enabled: true, host: '192.168.0.50'},
      });

    // Release's store: the same name, version and migration, persist's
    // default merge, and release's keys only.
    type ReleaseState = typeof RELEASE_STATE & {
      update: (changes: Partial<typeof RELEASE_STATE>) => void;
    };
    const release = create<ReleaseState>()(
      persist(
        (set) => ({
          ...RELEASE_STATE,
          host: '192.168.0.111',
          update: (changes) => {
            set(changes);
          },
        }),
        {
          name: 'settings',
          version: 3,
          storage: createJSONStorage(() => ({
            getItem: (name) => memory.get(name) ?? null,
            setItem: (name, value) => {
              memory.set(name, value);
            },
            removeItem: (name) => {
              memory.delete(name);
            },
          })),
          partialize: ({update: _update, ...settings}) => settings,
        },
      ),
    );
    expect(release.getState()).toMatchObject(RELEASE_STATE);
    // Release saves its own change and keeps the newer keys.
    release.getState().update({language: 'en'});
    expect(saved().state).toMatchObject({
      language: 'en',
      link: {enabled: true, host: '192.168.0.50'},
    });
  });

  it('keep what a newer version added', () => {
    memory.set(
      'settings',
      JSON.stringify({
        state: {
          ...RELEASE_STATE,
          fromTheFuture: {a: 1},
          link: {...DEFAULT_LINK_SETTINGS, futureField: 'x'},
        },
        version: 3,
      }),
    );
    loadStore().getState().update({language: 'en'});
    expect(saved().state).toMatchObject({
      fromTheFuture: {a: 1},
      link: {futureField: 'x'},
    });
  });

  it('replace invalid link settings with defaults', () => {
    memory.set(
      'settings',
      JSON.stringify({
        state: {...RELEASE_STATE, link: 'broken', rememberedLines: 5},
        version: 3,
      }),
    );
    const state = loadStore().getState();
    expect(state.link).toEqual(DEFAULT_LINK_SETTINGS);
    expect(state.rememberedLines).toEqual({});
    expect(state).toMatchObject(RELEASE_STATE);
  });
});
