import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/app/RootNavigator';
import { SkyBackground } from './src/components/SkyBackground';
import { AppProvider } from './src/state/AppProvider';
import { colors } from './src/theme/theme';

export default function App() {
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
