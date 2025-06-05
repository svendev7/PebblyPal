import { registerRootComponent } from 'expo';
import './config/firebase.client';
import { ExpoRoot } from 'expo-router';

// Creates a proper context for the router from your app directory
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
