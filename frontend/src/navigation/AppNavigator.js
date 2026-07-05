/**
 * Main stack — selection flow after auth + onboarding.
 *
 * Flow: Home → Material → Manufacturers → Tiles → Colors → Add Photo → Result
 */
import React from "react";
import { Text, Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import MaterialScreen from "../screens/MaterialScreen";
import ManufacturerListScreen from "../screens/ManufacturerListScreen";
import TileListScreen from "../screens/TileListScreen";
import ColorListScreen from "../screens/ColorListScreen";
import AddPhotoScreen from "../screens/AddPhotoScreen";
import ResultScreen from "../screens/ResultScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: "#334155" },
  headerTintColor: "#f8fafc",
  headerTitleStyle: { fontWeight: "600", fontSize: 17 },
};

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "RoofVision",
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate("Settings")} className="px-3 py-2 active:opacity-70">
              <Text className="text-[#e2e8f0] text-sm font-semibold">Settings</Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Material"
        component={MaterialScreen}
        options={{ title: "Select Material" }}
      />
      <Stack.Screen
        name="Manufacturers"
        component={ManufacturerListScreen}
        options={({ route }) => ({
          title: route.params?.materialLabel
            ? `${route.params.materialLabel} manufacturers`
            : "Select Manufacturer",
        })}
      />
      <Stack.Screen name="Tiles" component={TileListScreen} options={{ title: "Select product" }} />
      <Stack.Screen name="Colors" component={ColorListScreen} options={{ title: "Select color" }} />
      <Stack.Screen name="AddPhoto" component={AddPhotoScreen} options={{ title: "Add photo" }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ title: "Your visualization" }} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "About & settings" }}
      />
    </Stack.Navigator>
  );
}
