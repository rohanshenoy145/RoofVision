/**
 * Gates main app: auth → onboarding → catalog flow.
 */
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../screens/AuthScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AppNavigator from "./AppNavigator";

export default function RootNavigator() {
  const { hydrated, user, onboardingComplete } = useAuth();

  if (!hydrated) {
    return (
      <View className="flex-1 bg-[#0f172a] justify-center items-center">
        <ActivityIndicator size="large" color="#f8fafc" />
      </View>
    );
  }

  if (!user) return <AuthScreen />;
  if (!onboardingComplete) return <OnboardingScreen />;
  return <AppNavigator />;
}
