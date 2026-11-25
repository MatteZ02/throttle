import {create} from 'zustand';
import {
  ConnectionManager,
  ConnectionState,
  DeviceInfo,
  TrackStatus,
} from '../connection';

type ConnectionStoreState = {
  state: ConnectionState;
  trackStatus: TrackStatus;
  // Connected, but replies have stopped for a while. Driving stays possible.
  linkWeak: boolean;
  deviceInfo: DeviceInfo;
  // Android 17+: the user refused local network access, so the central
  // unit cannot be reached.
  localNetworkDenied: boolean;
};

export const useConnectionStore = create<ConnectionStoreState>(() => ({
  state: 'disconnected',
  trackStatus: 'unknown',
  linkWeak: false,
  deviceInfo: {},
  localNetworkDenied: false,
}));

// Mirrors the manager's state into the store. Returns an unbind function.
export const bindConnectionStore = (
  manager: Pick<
    ConnectionManager,
    'on' | 'getState' | 'getTrackStatus' | 'isLinkWeak' | 'getDeviceInfo'
  >,
): (() => void) => {
  useConnectionStore.setState({
    state: manager.getState(),
    trackStatus: manager.getTrackStatus(),
    linkWeak: manager.isLinkWeak(),
    deviceInfo: manager.getDeviceInfo(),
  });
  const unsubscribers = [
    manager.on('state', (state) => {
      useConnectionStore.setState({state});
    }),
    manager.on('trackStatus', (trackStatus) => {
      useConnectionStore.setState({trackStatus});
    }),
    manager.on('linkWeak', (linkWeak) => {
      useConnectionStore.setState({linkWeak});
    }),
    manager.on('deviceInfo', (deviceInfo) => {
      useConnectionStore.setState({deviceInfo});
    }),
  ];
  return () => {
    unsubscribers.forEach((unsubscribe) => {
      unsubscribe();
    });
  };
};
