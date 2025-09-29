// App.tsx
import React from 'react';
import { GestureHandlerRootView, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Home from './src/frontend/Home';

function AppInner() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Home />
    </GestureHandlerRootView>
  );
}

export default gestureHandlerRootHOC(AppInner);
