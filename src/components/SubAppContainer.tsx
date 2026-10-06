import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { LauncherApp } from '../types';
import { useHub } from '../context/HubContext';
import { HubStorage } from '../storage/hubStorage';

interface SubAppContainerProps {
  app: LauncherApp;
}

export const SubAppContainer: React.FC<SubAppContainerProps> = ({ app }) => {
  const { exitToHub, colors } = useHub();
  const appStorage = HubStorage.getAppStorage(app.id);

  const RootComponent = app.rootComponent;

  if (!RootComponent) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.textPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      <View style={styles.appViewport}>
        <RootComponent
          appId={app.id}
          onExitToHub={exitToHub}
          storage={appStorage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appViewport: {
    flex: 1,
  },
});
