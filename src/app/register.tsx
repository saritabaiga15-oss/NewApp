import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

export default function Register() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Mint Mist ambient accent */}
      <View style={styles.ambientAura} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 16, 32),
              paddingBottom: Math.max(insets.bottom + 16, 32),
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Palette.oceanTeal} />
          </TouchableOpacity>

          <View style={styles.container}>
            {/* Brand Logo */}
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/login-logo-clean.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.subtitle}>
              Start remembering and celebrating the people who shaped your journey.
            </Text>

            <TextInput
              placeholder="Full Name"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/home")}
              activeOpacity={0.88}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  ambientAura: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: Palette.mintMist,
    opacity: 0.28,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  container: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  logoWrapper: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  logoImage: {
    width: 58,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Palette.cream,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14.5,
    color: Palette.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  input: {
    height: 54,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    borderRadius: 18,
    paddingHorizontal: 18,
    color: Palette.cream,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  button: {
    height: 54,
    backgroundColor: Palette.oceanTeal,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  loginText: {
    color: Palette.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },
  loginLink: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
