/**
 * Root navigator - Stack Navigator for the selection flow.
 *
 * Flow: Home → Manufacturers → Tiles → Colors
 * We pass selected manufacturer/tile/color via route params as the user
 * moves forward. React Navigation handles the stack and back button.
 */
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import ManufacturerListScreen from "../screens/ManufacturerListScreen";
import TileListScreen from "../screens/TileListScreen";
import ColorListScreen from "../screens/ColorListScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1e293b" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "RoofVision" }}
      />
      <Stack.Screen
        name="Manufacturers"
        component={ManufacturerListScreen}
        options={{ title: "Select Manufacturer" }}
      />
      <Stack.Screen
        name="Tiles"
        component={TileListScreen}
        options={{ title: "Select Tile" }}
      />
      <Stack.Screen
        name="Colors"
        component={ColorListScreen}
        options={{ title: "Select Color" }}
      />
    </Stack.Navigator>
  );
}
