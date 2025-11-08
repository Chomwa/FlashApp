/**
 * @format
 */

// Add TextEncoder polyfill for QR code generation
import 'text-encoding';

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './package.json';

AppRegistry.registerComponent(appName, () => App);