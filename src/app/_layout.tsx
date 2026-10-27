import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { memoryService } from "@/services/memoryService";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import { tributeDraftService } from "@/services/tributeDraftService";
import { userProfileService } from "@/services/userProfileService";

export default function RootLayout() {
  useEffect(() => {
    Promise.all([
      memoryService.initialize(),
      storyBookmarkService.initialize(),
      tributeDraftService.initialize(),
      userProfileService.initialize(),
    ]).catch((error: unknown) => {
      console.error("Unable to initialize local app data:", error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="profile-edit" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="tributes" />
        <Stack.Screen name="saved-items" />
        <Stack.Screen name="memories" />
        <Stack.Screen name="create-mentor" />
        <Stack.Screen name="discover" />
        <Stack.Screen name="create" />
        <Stack.Screen name="create-tribute" />
        <Stack.Screen name="tribute-design" />
        <Stack.Screen name="tribute-preview" />
        <Stack.Screen name="memory-wall" />
        <Stack.Screen name="journey-timeline" />
        <Stack.Screen name="memory-detail/[id]" />
        <Stack.Screen name="mentor-profile/[id]" />
        <Stack.Screen name="stories/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
