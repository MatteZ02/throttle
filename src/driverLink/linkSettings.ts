import {z} from 'zod';

// Driver link settings (docs/driver-link.md section 11), kept in the app
// settings under `link`. Saved settings are validated field by field: a
// missing or invalid field falls back to its default, and fields this
// version does not know are kept, so a newer version's settings survive a
// round trip through an older one.

export const DEFAULT_LINK_PORT = 21110;

export type LinkSettings = {
  // Off by default; no link socket is opened until it is on and host is set.
  enabled: boolean;
  // Lever's IP address. Empty means no control station is set.
  host: string;
  port: number;
  // Optional; shown on Lever's strip.
  driverName: string;
  shareLocoInfo: boolean;
  shareLocoState: boolean;
  shareFunctions: boolean;
  // Remember the last line per loco, consist or plain address (per project).
  rememberLines: boolean;
  // Advanced.
  helloIntervalS: number;
  staleAfterS: number;
  retryMinS: number;
  retryMaxS: number;
  stateRatePerS: number;
};

export const DEFAULT_LINK_SETTINGS: LinkSettings = {
  enabled: false,
  host: '',
  port: DEFAULT_LINK_PORT,
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
};

// Allowed ranges of the numeric settings (whole numbers).
export const LINK_LIMITS = {
  port: {min: 1, max: 65535},
  helloIntervalS: {min: 1, max: 60},
  staleAfterS: {min: 2, max: 120},
  retryMinS: {min: 1, max: 60},
  retryMaxS: {min: 1, max: 600},
  stateRatePerS: {min: 1, max: 10},
} as const;

export const MAX_DRIVER_NAME_LENGTH = 40;

const whole = (key: keyof typeof LINK_LIMITS) =>
  z
    .number()
    .int()
    .min(LINK_LIMITS[key].min)
    .max(LINK_LIMITS[key].max)
    .catch(DEFAULT_LINK_SETTINGS[key]);

const flag = (key: keyof LinkSettings) =>
  z.boolean().catch(DEFAULT_LINK_SETTINGS[key] as boolean);

const linkSettingsSchema = z.looseObject({
  enabled: flag('enabled'),
  host: z.string().max(253).catch(DEFAULT_LINK_SETTINGS.host),
  port: whole('port'),
  driverName: z
    .string()
    .max(MAX_DRIVER_NAME_LENGTH)
    .catch(DEFAULT_LINK_SETTINGS.driverName),
  shareLocoInfo: flag('shareLocoInfo'),
  shareLocoState: flag('shareLocoState'),
  shareFunctions: flag('shareFunctions'),
  rememberLines: flag('rememberLines'),
  helloIntervalS: whole('helloIntervalS'),
  staleAfterS: whole('staleAfterS'),
  retryMinS: whole('retryMinS'),
  retryMaxS: whole('retryMaxS'),
  stateRatePerS: whole('stateRatePerS'),
});

// Saved (or missing) link settings, made valid. Unknown fields are kept.
export const normalizeLinkSettings = (
  saved: unknown,
): LinkSettings & Record<string, unknown> => {
  const parsed = linkSettingsSchema.parse(
    typeof saved === 'object' && saved !== null ? saved : {},
  );
  // The backoff can never shrink.
  return parsed.retryMaxS < parsed.retryMinS
    ? {...parsed, retryMaxS: parsed.retryMinS}
    : parsed;
};

// The last line per vehicle, keyed by project too (contract section 8):
// rememberedLineKey(projectId, vehicle).
export type RememberedLine = {lineId: string; directionId?: string};

// A vehicle on a throttle, for remembering its line.
export type LineVehicle =
  | {kind: 'loco'; id: number}
  | {kind: 'consist'; id: number}
  | {kind: 'address'; address: number};

export const rememberedLineKey = (
  projectId: string,
  vehicle: LineVehicle,
): string =>
  `${projectId}|${vehicle.kind}-${
    vehicle.kind === 'address' ? vehicle.address : vehicle.id
  }`;

const rememberedLineSchema = z.looseObject({
  lineId: z.string().min(1),
  directionId: z.string().min(1).optional(),
});

// Saved remembered lines, without invalid entries.
export const normalizeRememberedLines = (
  saved: unknown,
): Record<string, RememberedLine> => {
  if (typeof saved !== 'object' || saved === null || Array.isArray(saved)) {
    return {};
  }
  const result: Record<string, RememberedLine> = {};
  for (const [key, value] of Object.entries(saved)) {
    const parsed = rememberedLineSchema.safeParse(value);
    if (parsed.success) {
      result[key] = parsed.data;
    }
  }
  return result;
};
