import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Caveat_400Regular } from "@expo-google-fonts/caveat";
import "@/global.css";
import { memoryService } from "@/services/memoryService";
import { creationDraftService } from "@/services/creationDraftService";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import { tributeDraftService } from "@/services/tributeDraftService";
import { userProfileService } from "@/services/userProfileService";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Caveat_400Regular,
  });

  useEffect(() => {
    Promise.all([
      memoryService.initialize(),
      creationDraftService.initialize(),
      storyBookmarkService.initialize(),
      tributeDraftService.initialize(),
      userProfileService.initialize(),
    ]).catch((error: unknown) => {
      console.error("Unable to initialize local app data:", error);
    });
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Unable to load the Open Letter handwriting font:", fontError);
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) return null;

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
        <Stack.Screen name="creation-studio" />
        <Stack.Screen name="memo" />
        <Stack.Screen name="note" />
        <Stack.Screen name="open-letter" />
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
