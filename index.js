import { registerRootComponent } from 'expo';
import App from './App';

// Garante que o App seja registrado corretamente
// tanto no Expo Go quanto em builds nativos (Android/iOS).
registerRootComponent(App);
