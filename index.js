/**
 * @format
 */
// 1. Polyfill process first — react-native-crypto needs process.version
const process = require('process');
process.version = process.version || 'v16.0.0'; // fallback if empty
global.process = process;

// 2. Polyfill Buffer
global.Buffer = require('buffer').Buffer;

// 3. Now safe to import everything else
import 'react-native-randombytes'; 
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

if (__DEV__) {
    require("./ReactotronConfig");
}

AppRegistry.registerComponent(appName, () => App);
