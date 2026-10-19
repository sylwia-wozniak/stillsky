import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/app/RootNavigator';
import { enableTestFeatures } from './src/app/testFeatures';
import { SkyBackground } from './src/components/SkyBackground';
import { AppProvider } from './src/state/AppProvider';
import { colors } from './src/theme/theme';

/** `e2e` is set by the native side in the Android e2e build (see MainActivity.kt). */
export default function App({ e2e = false }: { e2e?: boolean }) {
  if (e2e) {
    enableTestFeatures();
  }
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <SkyBackground />
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
