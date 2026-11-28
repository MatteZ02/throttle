import {
  base36FromBytes,
  DEVICE_ID_PREFIX,
  ID_RANDOM_LENGTH,
  isDeviceId,
  makeId,
} from '../ids';

// A fixed byte sequence instead of the cryptographic source.
const bytesFrom = (values: number[]) => {
  let next = 0;
  return (count: number) =>
    Uint8Array.from({length: count}, () => values[next++ % values.length]);
};

describe('link ids (contract section 3)', () => {
  it('has the form <prefix>-<base-36 ms>-<random base 36>', () => {
    const now = Date.UTC(2026, 10, 28, 12, 0, 0);
    const id = makeId(DEVICE_ID_PREFIX, now, bytesFrom([0, 1, 35, 36, 71]));
    const [prefix, time, random] = id.split('-');
    expect(prefix).toBe('thr');
    expect(parseInt(time, 36)).toBe(now);
    expect(random).toHaveLength(ID_RANDOM_LENGTH);
    expect(random).toMatch(/^[0-9a-z]+$/);
    expect(random.startsWith('01z0z')).toBe(true);
    expect(isDeviceId(id)).toBe(true);
  });

  it('skips bytes that would bias the characters', () => {
    // 252…255 would make 0…3 more likely than the rest.
    expect(base36FromBytes(Uint8Array.from([252, 10, 255, 251]), 4)).toBe('az');
  });

  it('asks for more bytes when too many were skipped', () => {
    const random = jest.fn(bytesFrom([255, 255, 255, 1]));
    const id = makeId('thr', 1, random);
    expect(id).toBe('thr-1-111111111111');
    expect(random.mock.calls.length).toBeGreaterThan(1);
  });

  it('recognises device ids only', () => {
    expect(isDeviceId('thr-mif3k2p0-0123456789ab')).toBe(true);
    expect(isDeviceId('lvr-mif3k2p0-0123456789ab')).toBe(false);
    expect(isDeviceId('thr-mif3k2p0-0123')).toBe(false);
    expect(isDeviceId('')).toBe(false);
    expect(isDeviceId(undefined)).toBe(false);
  });
});
