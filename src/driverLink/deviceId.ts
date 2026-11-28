import {useSettingsStore} from '../store/settingsStore';
import {DEVICE_ID_PREFIX, isDeviceId, makeId, RandomBytes} from './ids';

// The phone's device id (contract section 3): generated once per
// installation and kept in settings. Returns the id, or null if no random
// source is available (the link then stays off).
export const ensureDeviceId = (
  randomBytes: RandomBytes | null,
  now: () => number = Date.now,
): string | null => {
  const {deviceId, update} = useSettingsStore.getState();
  if (isDeviceId(deviceId)) {
    return deviceId;
  }
  if (randomBytes === null) {
    return null;
  }
  const id = makeId(DEVICE_ID_PREFIX, now(), randomBytes);
  update({deviceId: id});
  return id;
};
