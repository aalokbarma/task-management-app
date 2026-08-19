import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { getFirebaseApp } from '../config/firebase';
import {
  startAuthSession,
  stopAuthSession,
} from '../features/auth/authSession';
import { RootNavigator } from '../navigation';
import {
  startConnectivityListener,
  stopConnectivityListener,
} from '../services/connectivity';
import {
  startNotificationService,
  stopNotificationService,
} from '../services/notifications';
import {
  startSyncService,
  stopSyncService,
} from '../services/sync';
import { ThemeProvider, useTheme } from '../theme';
import { store } from './store';

getFirebaseApp();

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

function AppContent(): React.JSX.Element {
  const theme = useTheme();

  useEffect(() => {
    startConnectivityListener(store.dispatch);
    startAuthSession(store.dispatch);
    startSyncService();
    startNotificationService();

    return () => {
      stopConnectivityListener();
      stopAuthSession();
      stopSyncService();
      stopNotificationService();
    };
  }, []);

  return (
    <>
      <StatusBar
        barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <RootNavigator />
    </>
  );
}

export default App;
