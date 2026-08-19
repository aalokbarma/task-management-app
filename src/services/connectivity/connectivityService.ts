import {
  addEventListener,
  fetch,
  type NetInfoState,
} from '@react-native-community/netinfo';
import type { AppDispatch } from '../../app/store';
import {
  connectivityChanged,
  type ConnectivityState,
} from '../../features/connectivity/connectivitySlice';
import { logger } from '../../utils/logger';

let unsubscribe: (() => void) | null = null;

export function mapNetInfoState(state: NetInfoState): ConnectivityState {
  return {
    isOnline:
      state.isConnected === true && state.isInternetReachable !== false,
    isInternetReachable: state.isInternetReachable,
  };
}

export function startConnectivityListener(dispatch: AppDispatch): void {
  if (unsubscribe) {
    return;
  }

  unsubscribe = addEventListener(state => {
    dispatch(connectivityChanged(mapNetInfoState(state)));
  });

  fetch()
    .then(state => {
      dispatch(connectivityChanged(mapNetInfoState(state)));
    })
    .catch(error => {
      logger.error(error, 'connectivity.fetch');
    });
}

export function stopConnectivityListener(): void {
  if (!unsubscribe) {
    return;
  }

  unsubscribe();
  unsubscribe = null;
}
