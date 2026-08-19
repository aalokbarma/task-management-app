import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { getFirebaseApp } from '../config/firebase';
import {
  startAuthSession,
  stopAuthSession,
} from '../features/auth/authSession';
import { startThemePreference } from '../features/theme/themeThunks';
import { RootNavigator } from '../navigation';
import {
  startConnectivityListener,
  stopConnectivityListener,
} from '../services/connectivity';
import {
  startMessagingService,
  stopMessagingService,
} from '../services/messaging';
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
    // Kick off all the background services once, when the app mounts.
    // Each one watches the Redux store on its own and reacts to auth /
    // connectivity changes, so we don't need to coordinate them here.
    startThemePreference(store.dispatch);
    startConnectivityListener(store.dispatch);
    startAuthSession(store.dispatch);
    startSyncService();
    startNotificationService();
    startMessagingService();

    return () => {
      stopConnectivityListener();
      stopAuthSession();
      stopSyncService();
      stopNotificationService();
      stopMessagingService();
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
