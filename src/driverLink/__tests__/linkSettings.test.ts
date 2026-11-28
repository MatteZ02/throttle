import {
  DEFAULT_LINK_SETTINGS,
  normalizeLinkSettings,
  normalizeRememberedLines,
  rememberedLineKey,
} from '../linkSettings';

describe('link settings', () => {
  it('has the contract defaults (section 11), with the link off', () => {
    expect(DEFAULT_LINK_SETTINGS).toEqual({
      enabled: false,
      host: '',
      port: 21110,
      driverName: '',
      shareLocoInfo: true,
      shareLocoState: true,
      shareFunctions: true,
      rememberLines: true,
      helloIntervalS: 3,
      staleAfterS: 6,
      retryMinS: 3,
      retryMaxS: 30,
      stateRatePerS: 4,
    });
  });

  it('gives defaults for missing settings', () => {
    expect(normalizeLinkSettings(undefined)).toEqual(DEFAULT_LINK_SETTINGS);
    expect(normalizeLinkSettings('nonsense')).toEqual(DEFAULT_LINK_SETTINGS);
  });

  it('keeps valid values and replaces invalid ones field by field', () => {
    expect(
      normalizeLinkSettings({
        enabled: true,
        host: '192.168.0.50',
        port: 70000,
        driverName: 'Matti',
        shareFunctions: 'yes',
        helloIntervalS: 2.5,
        stateRatePerS: 2,
      }),
    ).toEqual({
      ...DEFAULT_LINK_SETTINGS,
      enabled: true,
      host: '192.168.0.50',
      driverName: 'Matti',
      stateRatePerS: 2,
    });
  });

  it('never lets the backoff shrink', () => {
    expect(normalizeLinkSettings({retryMinS: 20, retryMaxS: 5})).toMatchObject({
      retryMinS: 20,
      retryMaxS: 20,
    });
  });

  it('keeps fields from a newer version', () => {
    expect(normalizeLinkSettings({fromTheFuture: 1})).toMatchObject({
      fromTheFuture: 1,
    });
  });
});

describe('remembered lines', () => {
  it('are keyed by project and vehicle', () => {
    expect(rememberedLineKey('prj-a-12345678', {kind: 'loco', id: 4})).toBe(
      'prj-a-12345678|loco-4',
    );
    expect(
      rememberedLineKey('prj-a-12345678', {kind: 'address', address: 3}),
    ).toBe('prj-a-12345678|address-3');
  });

  it('drop invalid entries', () => {
    expect(
      normalizeRememberedLines({
        'p|loco-1': {lineId: 'pun'},
        'p|loco-2': {lineId: 'pun', directionId: 'east'},
        'p|loco-3': {lineId: ''},
        'p|loco-4': 'pun',
      }),
    ).toEqual({
      'p|loco-1': {lineId: 'pun'},
      'p|loco-2': {lineId: 'pun', directionId: 'east'},
    });
    expect(normalizeRememberedLines(null)).toEqual({});
    expect(normalizeRememberedLines(['x'])).toEqual({});
  });
});
