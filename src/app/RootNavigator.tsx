import React from 'react';
import { View } from 'react-native';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../state/AppProvider';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { SkyScreen } from '../screens/SkyScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TID } from '../testIds';
import { colors } from '../theme/theme';

export type RootStackParamList = { Onboarding: undefined; Main: undefined };
export type TabParamList = { Focus: undefined; Sky: undefined; Stats: undefined; Settings: undefined };

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.surface,
  },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.star,
        tabBarInactiveTintColor: colors.muted,
      }}>
      <Tabs.Screen
        name="Focus"
        component={FocusScreen}
        options={{ tabBarButtonTestID: TID.tabs.focus, tabBarAccessibilityLabel: 'Focus tab' }}
      />
      <Tabs.Screen
        name="Sky"
        component={SkyScreen}
        options={{ tabBarButtonTestID: TID.tabs.sky, tabBarAccessibilityLabel: 'Sky tab' }}
      />
      <Tabs.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarButtonTestID: TID.tabs.stats, tabBarAccessibilityLabel: 'Stats tab' }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarButtonTestID: TID.tabs.settings, tabBarAccessibilityLabel: 'Settings tab' }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { ready, user } = useApp();
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
