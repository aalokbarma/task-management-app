/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerMessagingBackgroundHandler } from './src/services/messaging';
import { registerNotificationBackgroundHandler } from './src/services/notifications';

registerNotificationBackgroundHandler();
registerMessagingBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
