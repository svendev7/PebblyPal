// App.tsx
import React from 'react';
import { GestureHandlerRootView, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import MainContainer from './src/frontend/MainContainer';

function AppInner() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MainContainer />
    </GestureHandlerRootView>
  );
}

export default gestureHandlerRootHOC(AppInner);
