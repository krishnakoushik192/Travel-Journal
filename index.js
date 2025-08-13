/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '162657482896-4uqb7eaf060a30lup6ofnj817tacloav.apps.googleusercontent.com',
});

AppRegistry.registerComponent(appName, () => App);
