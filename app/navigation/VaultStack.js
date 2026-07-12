import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VaultScreen from '../screens/VaultScreen';
import AddCommodityScreen from '../screens/AddCommodityScreen';

const Stack = createNativeStackNavigator();

export default function VaultStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VaultHome" component={VaultScreen} />
      <Stack.Screen name="AddCommodity" component={AddCommodityScreen} />
    </Stack.Navigator>
  );
}