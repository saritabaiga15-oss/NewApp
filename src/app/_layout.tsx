import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Platform, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Caveat_400Regular } from "@expo-google-fonts/caveat";
import "@/global.css";
import { memoryService } from "@/services/memoryService";
import { creationDraftService } from "@/services/creationDraftService";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import { tributeDraftService } from "@/services/tributeDraftService";
import { userProfileService } from "@/services/userProfileService";
import { QrModalProvider, useQrModal } from "@/context/QrModalContext";
import ResponsiveHeader from "@/components/web/ResponsiveHeader";
import PwaInstallBanner from "@/components/web/PwaInstallBanner";
import { useResponsive } from "@/hooks/useResponsive";

function LayoutContent() {
  const { isDesktop, isTablet, isWeb } = useResponsive();
  const { openQrModal } = useQrModal();

  return (
    <View style={styles.rootWrapper}>
      {isWeb && <PwaInstallBanner onOpenQrModal={() => openQrModal("https://onodem.com")} />}
      {isWeb && <ResponsiveHeader onOpenQrModal={() => openQrModal("https://onodem.com")} />}
      <View style={[styles.mainShell, isWeb && (isDesktop || isTablet) && styles.desktopShell]}>
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
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...(Platform.OS === "web" ? {} : { Caveat_400Regular }),
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
      <QrModalProvider>
        <LayoutContent />
      </QrModalProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  mainShell: {
    flex: 1,
  },
  desktopShell: {
    maxWidth: 1240,
    width: "100%",
    marginHorizontal: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
  },
});
