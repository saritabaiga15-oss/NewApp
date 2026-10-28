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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { AppleLogo, FacebookLogo, GoogleLogo } from "@/components/SocialLogos";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Navigate to home screen
    router.replace("/home");
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
              style={styles.loginButtonWrapper}
              onPress={handleLogin}
              activeOpacity={0.88}
            >
              <View style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login</Text>
              </View>
            </TouchableOpacity>

            {/* "or continue with" Divider */}
            <Text style={styles.orText}>or continue with</Text>

            {/* Social Login Buttons: Google, Apple, Facebook */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialCircle}
                activeOpacity={0.75}
                onPress={handleLogin}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                <GoogleLogo size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircle}
                activeOpacity={0.75}
                onPress={handleLogin}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Apple"
              >
                <AppleLogo size={26} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircle}
                activeOpacity={0.75}
                onPress={handleLogin}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Facebook"
              >
                <FacebookLogo size={28} />
              </TouchableOpacity>
            </View>

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

  /* "or continue with" */
  orText: {
    color: Palette.textSecondary,
    fontSize: 13.5,
    textAlign: "center",
    marginTop: 22,
    marginBottom: 18,
    fontWeight: "500",
  },

  /* Social Buttons */
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 22,
  },
  socialCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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