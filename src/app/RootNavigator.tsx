import React from 'react';
import { View } from 'react-native';
import {
  DarkTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../state/AppProvider';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { SkyScreen } from '../screens/SkyScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TabIcon } from '../components/TabIcon';
import { TID } from '../testIds';
import { colors, fonts, tabBarStyle } from '../theme/theme';

export type RootStackParamList = { Onboarding: undefined; Main: undefined };
export type TabParamList = {
  Focus: undefined;
  Sky: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: 'transparent',
    card: 'transparent',
    text: colors.text,
    border: colors.glassBorder,
  },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle,
        tabBarLabelStyle: {
          fontFamily: fonts.regular,
          fontSize: 11,
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
        tabBarActiveTintColor: colors.star,
        tabBarInactiveTintColor: colors.muted,
      })}
    >
      <Tabs.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          tabBarButtonTestID: TID.tabs.focus,
          tabBarAccessibilityLabel: 'Focus',
        }}
      />
      <Tabs.Screen
        name="Sky"
        component={SkyScreen}
        options={{
          tabBarButtonTestID: TID.tabs.sky,
          tabBarAccessibilityLabel: 'Sky',
        }}
      />
      <Tabs.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarButtonTestID: TID.tabs.stats,
          tabBarAccessibilityLabel: 'Stats',
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarButtonTestID: TID.tabs.settings,
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { ready, user } = useApp();
  if (!ready) {
    return <View style={{ flex: 1 }} />;
  }
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
