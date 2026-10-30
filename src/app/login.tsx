import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
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

export default function Login() {
  const insets = useSafeAreaInsets();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmed = usernameOrEmail.trim();
    if (!trimmed || !password) {
      setErrorMessage("Please enter both email/username and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.auth.login({
        emailOrUsername: trimmed,
        password: password,
      });

      if (res?.data?.accessToken) {
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
        if (res.data.user) {
          await userProfileService.updateProfile({
            name: res.data.user.name || trimmed.split("@")[0],
            username: res.data.user.username || res.data.user.email?.split("@")[0] || trimmed.split("@")[0],
            email: res.data.user.email || (trimmed.includes("@") ? trimmed : ""),
            bio: res.data.user.bio || "Remembering the mentors and guides who shaped my life.",
            avatarUri:
              res.data.user.avatarUri ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          });
        }
        await userProfileService.syncWithBackend();
        router.replace("/home");
      } else {
        router.replace("/home");
      }
    } catch (err: any) {
      const msg = err.message || "Login failed";
      if (msg.toLowerCase().includes("bad credentials") || msg.toLowerCase().includes("401")) {
        setErrorMessage("Invalid credentials. Please verify your email and password.");
      } else {
        Alert.alert(
          "Connection Info",
          `${msg}. Would you like to proceed in local demo mode?`,
          [
            {
              text: "Proceed to Home",
              onPress: async () => {
                await userProfileService.updateProfile({
                  name: trimmed.split("@")[0],
                  username: trimmed.split("@")[0],
                  email: trimmed.includes("@") ? trimmed : "",
                });
                router.replace("/home");
              },
            },
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

      {/* Fresh Mint Mist Ambient Aura */}
      <View style={styles.ambientAura} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
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
          {/* Header / Logo Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo_transparent.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* "Welcome Back" */}
            <Text style={styles.title}>
              <Text style={styles.welcomeText}>Welcome </Text>
              <Text style={styles.backText}>Back</Text>
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>Sign in to honour those who shaped you</Text>
          </View>

          {/* Input Form Fields */}
          <View style={styles.formContainer}>
            {/* Username or Email Input */}
            <View style={styles.inputCard}>
              <Ionicons
                name="person"
                size={20}
                color={Palette.oceanTeal}
                style={styles.inputLeadingIcon}
              />
              <View style={styles.inputDivider} />
              <TextInput
                value={usernameOrEmail}
                onChangeText={setUsernameOrEmail}
                placeholder="Username or Email"
                placeholderTextColor={Palette.textMuted}
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={Palette.oceanTeal}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputCard}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={Palette.oceanTeal}
                style={styles.inputLeadingIcon}
              />
              <View style={styles.inputDivider} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={Palette.textMuted}
                secureTextEntry={!showPassword}
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={Palette.oceanTeal}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.eyeToggle}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-outline"}
                  size={22}
                  color={Palette.turquoise}
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Password Forgot Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Login Button (Ocean Teal) */}
            <TouchableOpacity
              style={[styles.loginButtonWrapper, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.88}
              disabled={loading}
            >
              <View style={styles.loginButton}>
                {loading ? (
                  <ActivityIndicator color={Palette.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Don't have an account link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Don&apos;t have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.registerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: Palette.iceWhite, // Ice White background
  },
  ambientAura: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: Palette.mintMist,
    opacity: 0.28,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },

  /* Header / Logo */
  headerSection: {
    alignItems: "center",
    marginBottom: 26,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 82,
    height: 84,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 6,
  },
  welcomeText: {
    color: Palette.cream,
    fontWeight: "800",
  },
  backText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14.5,
    color: Palette.textSecondary,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.1,
  },

  /* Form */
  formContainer: {
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: Palette.pureWhite, // Pure White input
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputLeadingIcon: {
    marginRight: 2,
  },
  inputDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(84, 0, 14, 0.14)",
    marginHorizontal: 12,
  },
  textInput: {
    flex: 1,
    color: Palette.deepTeal,
    fontSize: 15.5,
    fontWeight: "600",
    paddingVertical: 0,
  },
  eyeToggle: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Error Banner */
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

  /* Forgot Password */
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* Primary Login Button */
  loginButtonWrapper: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  loginButton: {
    height: 56,
    backgroundColor: Palette.oceanTeal, // Ocean Teal primary button
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* Register link row */
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  registerPrompt: {
    fontSize: 14,
    color: Palette.textSecondary,
    fontWeight: "500",
  },
  registerLink: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "800",
  },
});