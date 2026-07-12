import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings } from "lucide-react-native";

import { LayoutDashboard, Database } from 'lucide-react-native';

import DashboardStack from './DashboardStack';
import VaultStack from './VaultStack';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator();

/**
 * Animated icon + gradient glow
 */
function TabIcon({ focused, Icon, type }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();

    if (focused) {
      Haptics.selectionAsync();
    }
  }, [focused]);

  const colors = ["#e94560", "#ff6b81"];

  const icon = (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <Icon
        size={22}
        color={focused ? "#fff" : "#888"}
      />
    </Animated.View>
  );

  if (!focused) {
    return icon;
  }

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icon}
    </LinearGradient>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          position: "absolute",
          height: 82,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopWidth: 0,
          backgroundColor: "transparent",
        },

        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#8a8a8a',

        tabBarBackground: () => (
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              Icon={LayoutDashboard}
              type="dashboard"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Vault"
        component={VaultStack}
        options={{
          tabBarLabel: 'Vault',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              Icon={Database}
              type="vault"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              Icon={Settings}
              type="settings"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}