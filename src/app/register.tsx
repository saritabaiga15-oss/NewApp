import React, { useState } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { api, setAuthToken } from "@/services/api";
import { userProfileService } from "@/services/userProfileService";

export default function Register() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.auth.register({
        name: trimmedName,
        email: trimmedEmail,
        password: password,
      });

      if (res?.data?.accessToken) {
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
        if (res.data.user) {
          await userProfileService.updateProfile({
            name: res.data.user.name,
            username: res.data.user.username || res.data.user.email?.split("@")[0] || "user",
            email: res.data.user.email,
            bio: res.data.user.bio || "Grateful mentee",
            avatarUri:
              res.data.user.avatarUri ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          });
        }
        router.replace("/home");
      } else {
        router.replace("/home");
      }
    } catch (err: any) {
      const msg = err.message || "Registration failed";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("duplicate")) {
        setErrorMessage("An account with this email already exists. Try logging in.");
      } else {
        Alert.alert(
          "Registration Notice",
          `${msg}. Would you like to proceed to Home in demo mode?`,
          [
            { text: "Proceed to Home", onPress: () => router.replace("/home") },
            { text: "Retry", style: "cancel" },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

            {/* Error Banner */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <TextInput
              placeholder="Full Name"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Password (min 8 characters)"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              activeOpacity={0.88}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Palette.textOnPrimary} size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
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
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(32, 32, 32, 0.4)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.mintMist,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  container: {
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Palette.cream,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.textSecondary,
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.35)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF8E8E",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  input: {
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Palette.deepTeal,
    fontSize: 15,
    marginBottom: 14,
  },
  button: {
    backgroundColor: Palette.oceanTeal,
    borderRadius: 24,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: Palette.textOnPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  loginText: {
    textAlign: "center",
    color: Palette.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Palette.oceanTeal,
    fontWeight: "700",
  },
});
