import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
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
