// Ids of the driver link (docs/driver-link.md section 3):
// `<prefix>-<timestamp>-<random>`, the timestamp in milliseconds since 1970
// in base 36, the random part base-36 characters from a cryptographic
// source. Pure: the caller supplies the time and the random bytes.
//
// TODO(driver-link package): use the package's id helpers once it is copied,
// if they match this.

export const DEVICE_ID_PREFIX = 'thr';

// The contract asks for at least 8; 12 gives about 62 bits.
export const ID_RANDOM_LENGTH = 12;

const BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz';

// 252 = 7 × 36: bytes at or above it are skipped, so every character is
// equally likely.
const UNBIASED_LIMIT = 252;

// Base-36 characters from random bytes, without modulo bias. Returns fewer
// than `length` characters if the bytes run out.
export const base36FromBytes = (bytes: Uint8Array, length: number): string => {
  let result = '';
  for (const byte of bytes) {
    if (result.length === length) {
      break;
    }
    if (byte < UNBIASED_LIMIT) {
      result += BASE36[byte % 36];
    }
  }
  return result;
};

export type RandomBytes = (count: number) => Uint8Array;

export const makeId = (
  prefix: string,
  nowMs: number,
  randomBytes: RandomBytes,
): string => {
  let random = '';
  // Twice the length almost always suffices; ask again if not.
  while (random.length < ID_RANDOM_LENGTH) {
    random += base36FromBytes(
      randomBytes(ID_RANDOM_LENGTH * 2),
      ID_RANDOM_LENGTH - random.length,
    );
  }
  return `${prefix}-${nowMs.toString(36)}-${random}`;
};

const ID_PATTERN = /^[a-z]+-[0-9a-z]+-[0-9a-z]{8,}$/;

export const isId = (value: unknown, prefix: string): value is string =>
  typeof value === 'string' &&
  ID_PATTERN.test(value) &&
  value.startsWith(`${prefix}-`);

export const isDeviceId = (value: unknown): value is string =>
  isId(value, DEVICE_ID_PREFIX);
