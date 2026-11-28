import type {RandomBytes} from './ids';

// The cryptographic random source for link ids: expo-crypto (Expo 58 and
// Hermes have no crypto.getRandomValues). The only file importing it.
//
// Loaded on first use, not at the top: a development build made before
// expo-crypto was added has no native module, and the app (with its STOP
// button) must still start. The link then has no device id and stays off.
export const nativeRandomBytes = (): RandomBytes | null => {
  try {
    const Crypto = require('expo-crypto') as {
      getRandomBytes: (count: number) => Uint8Array;
    };
    return (count) => Crypto.getRandomBytes(count);
  } catch (error) {
    console.warn('No cryptographic random source; driver link off', error);
    return null;
  }
};
