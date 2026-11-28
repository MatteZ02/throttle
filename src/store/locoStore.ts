import {create} from 'zustand';
import {DisplayedLoco} from '../driving/locoIntent';

export type LiveLoco = DisplayedLoco & {
  // Another controller is also driving this loco (brief §6.3).
  shared: boolean;
  // When another controller last changed speed or direction (0 = never).
  foreignDriveAt: number;
  // A local change (speed, direction or a function) is shown but not yet
  // reported by the central unit. Read-only information for observers such
  // as the driver link; driving does not use it.
  pending: boolean;
};

type LocoStoreState = {
  // Locos currently shown on screen, by address. Written only by
  // DriveController.
  locos: Partial<Record<number, LiveLoco>>;
};

export const useLocoStore = create<LocoStoreState>(() => ({locos: {}}));

export const useLiveLoco = (address: number | null): LiveLoco | undefined =>
  useLocoStore((state) =>
    address === null ? undefined : state.locos[address],
  );
