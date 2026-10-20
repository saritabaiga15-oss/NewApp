import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  requestPasswordReset,
  verifyResetCode,
  updatePassword,
} from "@/services/auth";

// Exact User-Specified Colors
const THEME = {
  primary: "#4F46E5", // Soft Indigo / Purple Accent (Prominent & Vibrant)
  primaryHover: "#4338CA", // Deep Indigo for pressed states
  primarySoft: "#EEF2FF", // Soft Lavender / Indigo container background
  primaryBorderSoft: "rgba(79, 70, 229, 0.22)",
  heading: "#17213A", // Dark Navy Headings
  textBody: "#334155",
  textMuted: "#64748B", // Subtle Slate
  placeholder: "#94A3B8",
  background: "#F8FAFC", // Clean light canvas
  card: "#FFFFFF",
  border: "#E2E8F0", // Subtle Grey Borders
  borderFocus: "#4F46E5", // Active Input Border
  borderError: "#EF4444",
  errorText: "#DC2626",
  errorBg: "#FEF2F2",
  success: "#10B981",
  successSoft: "#ECFDF5",
  successBorder: "#A7F3D0",
};

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

  // Current Step in the Figma flow
  const [step, setStep] = useState<Step>("EMAIL");

  // Step 1: Email State
  const [email, setEmail] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  // Step 2: 5-Digit OTP Code State
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(45);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Step 3: New Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  // Shared UX State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // Countdown timer for code resend
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Back Navigation Handler
  const handleBack = () => {
    setErrorMessage(null);
    if (step === "NEW_PASSWORD") {
      setStep("OTP");
    } else if (step === "OTP") {
      setStep("EMAIL");
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/login");
      }
    }
  };

  // 1. Submit Email -> Move to OTP
  const handleEmailSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await requestPasswordReset(trimmed);
      setStep("OTP");
      setResendTimer(45);
      setIsTimerActive(true);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle OTP Input Changes
  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const updated = [...otp];

    if (cleaned.length > 1) {
      // Handle paste
      const pastedDigits = cleaned.slice(0, 5).split("");
      pastedDigits.forEach((digit, i) => {
        if (i < 5) updated[i] = digit;
      });
      setOtp(updated);
      const nextIndex = Math.min(pastedDigits.length, 4);
      otpRefs.current[nextIndex]?.focus();
    } else {
      updated[index] = cleaned;
      setOtp(updated);
      if (cleaned && index < 4) {
        otpRefs.current[index + 1]?.focus();
      }
    }

    if (errorMessage) setErrorMessage(null);
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (isTimerActive || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setResendTimer(45);
      setIsTimerActive(true);
      setOtp(["", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 5) {
      setErrorMessage("Please enter the complete 5-digit verification code.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await verifyResetCode(email.trim(), code);
      setStep("NEW_PASSWORD");
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit New Password -> Show Success Modal
  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await updatePassword(newPassword);
      setIsSuccessModalVisible(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      {/* Ambient Aura Gradient behind header */}
      <View style={styles.ambientAura} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingTop: Math.max(insets.top + 8, 20),
              paddingBottom: Math.max(insets.bottom + 16, 28),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color={THEME.heading} />
            </Pressable>
          </View>

          {/* Centered Main Content Area */}
          <View style={styles.contentContainer}>
            {/* ============================================================= */}
            {/* STEP 1: FORGOT PASSWORD (EMAIL INPUT) */}
            {/* ============================================================= */}
            {step === "EMAIL" && (
              <View style={styles.stepWrapper}>
                {/* Hero Mail Icon Container */}
                <View style={styles.heroSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="mail" size={34} color={THEME.primary} />
                  </View>

                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    No worries! Enter your email address and we&apos;ll send you instructions to reset your password.
                  </Text>
                </View>

                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={THEME.errorText}
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                {/* Form Card */}
                <View style={styles.cardContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Your Email</Text>
                    <View
                      style={[
                        styles.inputCard,
                        isEmailFocused && styles.inputCardFocused,
                        !!errorMessage && styles.inputCardError,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={isEmailFocused ? THEME.primary : THEME.textMuted}
                        style={styles.inputLeadingIcon}
                      />
                      <TextInput
                        value={email}
                        onChangeText={(t) => {
                          setEmail(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        placeholder="you@example.com"
                        placeholderTextColor={THEME.placeholder}
                        style={styles.textInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="done"
                        onSubmitEditing={handleEmailSubmit}
                        editable={!isLoading}
                      />
                      {email.length > 0 && !isLoading && (
                        <Pressable
                          onPress={() => setEmail("")}
                          hitSlop={8}
                          accessibilityLabel="Clear email"
                        >
                          <Ionicons name="close-circle" size={18} color={THEME.textMuted} />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Primary Action Button (Always #4F46E5!) */}
                  <Pressable
                    onPress={handleEmailSubmit}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && !isLoading && styles.primaryButtonPressed,
                      isLoading && styles.primaryButtonLoading,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Send Reset Link"
                  >
                    {isLoading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Sending...</Text>
                      </View>
                    ) : (
                      <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* ============================================================= */}
            {/* STEP 2: CHECK YOUR EMAIL (5-DIGIT OTP VERIFICATION) */}
            {/* ============================================================= */}
            {step === "OTP" && (
              <View style={styles.stepWrapper}>
                <View style={styles.heroSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="chatbubble-ellipses" size={32} color={THEME.primary} />
                  </View>

                  <Text style={styles.title}>Check your email</Text>
                  <Text style={styles.subtitle}>
                    We sent a reset link to <Text style={styles.highlightText}>{email.trim()}</Text>
                    {"\n"}enter 5 digit code that mentioned in the email
                  </Text>
                </View>

                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={THEME.errorText}
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                <View style={styles.cardContainer}>
                  {/* 5 Digit Input Boxes */}
                  <View style={styles.otpRow}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={({ nativeEvent }) =>
                          handleOtpKeyPress(nativeEvent.key, index)
                        }
                        onFocus={() => setFocusedOtpIndex(index)}
                        onBlur={() => setFocusedOtpIndex(null)}
                        keyboardType="number-pad"
                        maxLength={index === 0 ? 5 : 1}
                        selectTextOnFocus
                        style={[
                          styles.otpBox,
                          digit ? styles.otpBoxFilled : undefined,
                          focusedOtpIndex === index && styles.otpBoxFocused,
                        ]}
                      />
                    ))}
                  </View>

                  {/* Verify Code Button (#4F46E5) */}
                  <Pressable
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && !isLoading && styles.primaryButtonPressed,
                      isLoading && styles.primaryButtonLoading,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Verify Code"
                  >
                    {isLoading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Verifying...</Text>
                      </View>
                    ) : (
                      <Text style={styles.primaryButtonText}>Verify Code</Text>
                    )}
                  </Pressable>

                  {/* Resend Code Link */}
                  <View style={styles.resendRow}>
                    <Text style={styles.resendMuted}>Haven&apos;t got the email yet? </Text>
                    <Pressable
                      onPress={handleResendCode}
                      disabled={isTimerActive || isLoading}
                      hitSlop={8}
                    >
                      <Text
                        style={[
                          styles.resendLink,
                          isTimerActive && styles.resendLinkDisabled,
                        ]}
                      >
                        {isTimerActive ? `Resend in ${resendTimer}s` : "Resend email"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* ============================================================= */}
            {/* STEP 3: SET A NEW PASSWORD */}
            {/* ============================================================= */}
            {step === "NEW_PASSWORD" && (
              <View style={styles.stepWrapper}>
                <View style={styles.heroSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={32} color={THEME.primary} />
                  </View>

                  <Text style={styles.title}>Set a new password</Text>
                  <Text style={styles.subtitle}>
                    Create a new password. Ensure it differs from previous ones for security
                  </Text>
                </View>

                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={THEME.errorText}
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                <View style={styles.cardContainer}>
                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View
                      style={[
                        styles.inputCard,
                        isPasswordFocused && styles.inputCardFocused,
                      ]}
                    >
                      <TextInput
                        value={newPassword}
                        onChangeText={(t) => {
                          setNewPassword(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        placeholder="Enter your new password"
                        placeholderTextColor={THEME.placeholder}
                        secureTextEntry={!showPassword}
                        style={styles.textInput}
                        autoCapitalize="none"
                      />
                      <Pressable
                        onPress={() => setShowPassword((p) => !p)}
                        hitSlop={10}
                        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      >
                        <Ionicons
                          name={showPassword ? "eye" : "eye-off-outline"}
                          size={20}
                          color={THEME.textMuted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View
                      style={[
                        styles.inputCard,
                        isConfirmFocused && styles.inputCardFocused,
                      ]}
                    >
                      <TextInput
                        value={confirmPassword}
                        onChangeText={(t) => {
                          setConfirmPassword(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onFocus={() => setIsConfirmFocused(true)}
                        onBlur={() => setIsConfirmFocused(false)}
                        placeholder="Re-enter password"
                        placeholderTextColor={THEME.placeholder}
                        secureTextEntry={!showConfirmPassword}
                        style={styles.textInput}
                        autoCapitalize="none"
                      />
                      <Pressable
                        onPress={() => setShowConfirmPassword((p) => !p)}
                        hitSlop={10}
                        accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye" : "eye-off-outline"}
                          size={20}
                          color={THEME.textMuted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Update Password Button (#4F46E5) */}
                  <Pressable
                    onPress={handleUpdatePassword}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && !isLoading && styles.primaryButtonPressed,
                      isLoading && styles.primaryButtonLoading,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Update Password"
                  >
                    {isLoading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Updating...</Text>
                      </View>
                    ) : (
                      <Text style={styles.primaryButtonText}>Update Password</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* Footer Row */}
            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>Remember your password? </Text>
              <Pressable
                onPress={() => router.replace("/login")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Back to Login"
              >
                <Text style={styles.footerLink}>Back to Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ================================================================= */}
      {/* STEP 4: SUCCESS MODAL / DIALOG (From Figma Frame 15) */}
      {/* ================================================================= */}
      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => router.replace("/login")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark" size={38} color={THEME.primary} />
            </View>

            <Text style={styles.modalTitle}>Successful</Text>
            <Text style={styles.modalSubtitle}>
              Congratulations! Your password has been changed. Click continue to login
            </Text>

            <Pressable
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.replace("/login");
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.modalButton,
                pressed && styles.primaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Continue to Login"
            >
              <Text style={styles.primaryButtonText}>Continue to Login</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  ambientAura: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: THEME.primarySoft,
    opacity: 0.65,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },

  /* Top Navigation Bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.card,
    borderWidth: 1.2,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: THEME.heading,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  backButtonPressed: {
    backgroundColor: "#F1F5F9",
    transform: [{ scale: 0.96 }],
  },

  /* Content Wrapper */
  contentContainer: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  stepWrapper: {
    width: "100%",
  },

  /* Hero Section */
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: THEME.primarySoft,
    borderWidth: 1.5,
    borderColor: THEME.primaryBorderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },

  /* Typography */
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.heading, // Dark Navy
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: THEME.textMuted,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  highlightText: {
    color: THEME.heading,
    fontWeight: "700",
  },

  /* Error Banner */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.errorBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13.5,
    color: THEME.errorText,
    fontWeight: "600",
    lineHeight: 18,
  },

  /* Card Container */
  cardContainer: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: THEME.border,
    padding: 22,
    ...Platform.select({
      ios: {
        shadowColor: THEME.heading,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },

  /* Input Fields */
  inputGroup: {
    width: "100%",
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.heading, // Dark Navy
    marginBottom: 8,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.border,
    paddingHorizontal: 16,
  },
  inputCardFocused: {
    borderColor: THEME.borderFocus, // #4F46E5
    backgroundColor: THEME.card,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  inputCardError: {
    borderColor: THEME.borderError,
  },
  inputLeadingIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.heading,
    paddingVertical: 0,
    fontWeight: "600",
  },

  /* 5-Digit OTP Boxes */
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  otpBox: {
    width: 52,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.border,
    backgroundColor: "#F8FAFC",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: THEME.heading,
  },
  otpBoxFilled: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primarySoft,
  },
  otpBoxFocused: {
    borderColor: THEME.primary,
    backgroundColor: THEME.card,
    borderWidth: 2,
  },

  /* Primary Button (Always Rich #4F46E5) */
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: THEME.primary, // #4F46E5
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.38,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  primaryButtonPressed: {
    backgroundColor: THEME.primaryHover, // #4338CA
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonLoading: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  /* Resend Row */
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  resendMuted: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: "500",
  },
  resendLink: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "800",
  },
  resendLinkDisabled: {
    color: THEME.textMuted,
    fontWeight: "500",
  },

  /* Footer */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  footerMuted: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: "500",
  },
  footerLink: {
    fontSize: 14,
    color: THEME.primary, // #4F46E5
    fontWeight: "800",
  },

  /* Success Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(23, 33, 58, 0.5)",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalCard: {
    backgroundColor: THEME.card,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: THEME.heading,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  modalIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: THEME.primarySoft,
    borderWidth: 2,
    borderColor: THEME.primaryBorderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.heading,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: THEME.textMuted,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  modalButton: {
    marginBottom: 0,
  },
});
