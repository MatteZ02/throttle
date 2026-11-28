import {useSettingsStore} from '../../store/settingsStore';
import {ensureDeviceId} from '../deviceId';
import {isDeviceId} from '../ids';

jest.mock('expo-sqlite/kv-store', () =>
  jest.requireActual('../../store/testUtils/memoryKvStore'),
);

const random = (count: number) => Uint8Array.from({length: count}, (_, i) => i);

describe('device id', () => {
  beforeEach(() => {
    useSettingsStore.setState({deviceId: ''});
  });

  it('is generated once and kept in settings', () => {
    const id = ensureDeviceId(random, () => 1000);
    expect(isDeviceId(id)).toBe(true);
    expect(useSettingsStore.getState().deviceId).toBe(id);
    expect(ensureDeviceId(random, () => 2000)).toBe(id);
  });

  it('replaces a damaged saved id', () => {
    useSettingsStore.setState({deviceId: 'garbage'});
    expect(isDeviceId(ensureDeviceId(random))).toBe(true);
  });

  it('stays empty without a random source', () => {
    expect(ensureDeviceId(null)).toBeNull();
    expect(useSettingsStore.getState().deviceId).toBe('');
  });
});
