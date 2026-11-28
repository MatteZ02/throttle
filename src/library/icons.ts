import type {IconName} from '../ui/components/Icon';

// The app's own function icons (MaterialCommunityIcons, Apache-2.0). Roco's
// icons are not used; the importer (Phase 5) maps Roco's icon identifiers to
// these ids. 'none' shows the plain function letter.
export const FUNCTION_ICONS = {
  none: null,
  light: 'lightbulb-on',
  headlight: 'car-light-high',
  lowBeam: 'car-light-dimmed',
  tailLight: 'car-parking-lights',
  cabLight: 'lightbulb-outline',
  interiorLight: 'ceiling-light',
  lightsOff: 'lightbulb-off',
  ditchLight: 'car-light-fog',
  shuntingLight: 'flashlight',
  beacon: 'alarm-light',
  destination: 'sign-direction',
  sound: 'volume-high',
  horn: 'bullhorn',
  hornLow: 'bullhorn-outline',
  airHorn: 'air-horn',
  whistle: 'whistle',
  whistleShort: 'whistle-outline',
  bell: 'bell',
  announcement: 'account-voice',
  guard: 'account-tie-hat',
  radio: 'radio',
  music: 'music',
  mute: 'volume-off',
  volumeUp: 'volume-plus',
  volumeDown: 'volume-minus',
  railJoints: 'vibrate',
  curveSqueal: 'sine-wave',
  buffers: 'arrow-collapse-horizontal',
  engine: 'engine',
  mainSwitch: 'power',
  battery: 'car-battery',
  generator: 'flash',
  brake: 'car-brake-alert',
  handbrake: 'car-brake-parking',
  dynamicBrake: 'car-brake-temperature',
  brakeTest: 'gauge',
  compressor: 'air-filter',
  pump: 'water-pump',
  gear: 'car-shift-pattern',
  fuel: 'fuel',
  fan: 'fan',
  sand: 'grain',
  smoke: 'smoke',
  steam: 'weather-windy',
  firebox: 'fire',
  coal: 'shovel',
  water: 'water',
  pantograph: 'transmission-tower',
  doorOpen: 'door-open',
  doorClose: 'door-closed',
  heating: 'radiator',
  airCon: 'snowflake',
  toilet: 'toilet',
  couple: 'link-variant',
  uncouple: 'link-variant-off',
  shunting: 'tortoise',
  momentum: 'rabbit',
  crane: 'crane',
  hook: 'hook',
  magnet: 'magnet',
  rotateLeft: 'rotate-left',
  rotateRight: 'rotate-right',
  up: 'arrow-up-bold',
  down: 'arrow-down-bold',
  wiper: 'wiper',
  timer: 'timer-outline',
  generic: 'cog',
} as const satisfies Record<string, IconName | null>;

export type FunctionIconId = keyof typeof FUNCTION_ICONS;

export const FUNCTION_ICON_IDS = Object.keys(
  FUNCTION_ICONS,
) as FunctionIconId[];

export const isFunctionIconId = (id: string): id is FunctionIconId =>
  Object.prototype.hasOwnProperty.call(FUNCTION_ICONS, id);

// Unknown ids (e.g. from a newer app version) fall back to the plain letter.
export const functionIcon = (id: string): IconName | null =>
  isFunctionIconId(id) ? FUNCTION_ICONS[id] : null;
