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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import { api, getAuthToken, setAuthToken } from "@/services/api";
import { signOut } from "@/services/auth";
import { userProfileService } from "@/services/userProfileService";
import { GoogleLogo } from "@/components/SocialLogos";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");

  // Email form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone form fields
  const countryCode = "+91";
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Session Detection (prevents stuck session confusion)
  const [activeUser, setActiveUser] = useState<{ name: string; username: string; email?: string } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const profile = await userProfileService.getProfile();
          if (profile && (profile.name || profile.username)) {
            setActiveUser({
              name: profile.name || "User",
              username: profile.username || "user",
              email: profile.email || "",
            });
          }
        }
      } catch {}
    })();
  }, []);

  // Email Login Handler
  const handleEmailLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.auth.login({
        emailOrUsername: trimmedEmail,
        password: password,
      });

      if (res?.data?.accessToken) {
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
        if (res.data.user) {
          await userProfileService.updateProfile({
            name: res.data.user.name || trimmedEmail.split("@")[0],
            username: res.data.user.username || trimmedEmail.split("@")[0],
            email: res.data.user.email || trimmedEmail,
            phone: res.data.user.phone || "",
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
      const errMsg = (err.message || "").toLowerCase();
      if (
        errMsg.includes("bad credentials") ||
        errMsg.includes("401") ||
        errMsg.includes("invalid") ||
        errMsg.includes("unauthorized")
      ) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage(err.message || "Unable to sign in. Please check your credentials or server connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Continue with Phone Handler
  const handlePhoneLogin = async () => {
    router.push("/phone-login" as any);
  };

  // Google Sign-In with backend authentication
  const handleGoogleLogin = async (customEmail?: string) => {
    let targetEmail = customEmail;
    if (!targetEmail && Platform.OS === "web" && typeof window !== "undefined") {
      const entered = window.prompt("Enter your Google email address to sign in:");
      if (!entered || !entered.trim()) return;
      targetEmail = entered.trim();
    }
    if (!targetEmail) return;
    targetEmail = targetEmail.trim().toLowerCase();

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.auth.googleLogin({
        email: targetEmail,
        name: targetEmail.split("@")[0],
        avatarUri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      });

      if (res?.data?.accessToken) {
        await setAuthToken(res.data.accessToken, res.data.refreshToken);
        if (res.data.user) {
          await userProfileService.updateProfile({
            name: res.data.user.name || targetEmail.split("@")[0],
            username: res.data.user.username || targetEmail.split("@")[0],
            email: res.data.user.email || targetEmail,
            phone: res.data.user.phone || "",
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
      setErrorMessage(err.message || "Google sign-in failed. Please check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fresh Mint Ambient Aura */}
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

            {/* Active Session Notice if already logged in */}
            {activeUser && (
              <View style={styles.activeSessionCard}>
                <View style={styles.activeSessionTop}>
                  <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.activeSessionTitle}>
                      Currently signed in as <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>{activeUser.name}</Text>
                    </Text>
                    <Text style={styles.activeSessionSubtitle}>
                      @{activeUser.username} {activeUser.email ? `• ${activeUser.email}` : ""}
                    </Text>
                  </View>
                </View>
                <View style={styles.activeSessionBtns}>
                  <TouchableOpacity
                    style={styles.activeSessionContinueBtn}
                    onPress={() => router.replace("/home")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.activeSessionContinueText}>Go to Dashboard →</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.activeSessionSignOutBtn}
                    onPress={async () => {
                      await signOut();
                      setActiveUser(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.activeSessionSignOutText}>Sign Out / Switch</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Mode Selector Tabs: Email / Phone */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => {
                  setAuthMode("email");
                  setErrorMessage(null);
                }}
                activeOpacity={0.8}
                style={[styles.tabButton, authMode === "email" && styles.tabButtonActive]}
              >
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={authMode === "email" ? "#000000" : "#A0A0A0"}
                />
                <Text style={[styles.tabButtonText, authMode === "email" && styles.tabButtonTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setAuthMode("phone");
                  setErrorMessage(null);
                }}
                activeOpacity={0.8}
                style={[styles.tabButton, authMode === "phone" && styles.tabButtonActive]}
              >
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={authMode === "phone" ? "#000000" : "#A0A0A0"}
                />
                <Text style={[styles.tabButtonText, authMode === "phone" && styles.tabButtonTextActive]}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode 1: Email & Password */}
            {authMode === "email" && (
              <>
                {/* Email Input */}
                <View style={styles.inputCard}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Palette.oceanTeal}
                    style={styles.inputLeadingIcon}
                  />
                  <View style={styles.inputDivider} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email address"
                    placeholderTextColor={Palette.textMuted}
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    selectionColor={Palette.oceanTeal}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputCard}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Palette.oceanTeal}
                    style={styles.inputLeadingIcon}
                  />
                  <View style={styles.inputDivider} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
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

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  activeOpacity={0.7}
                  onPress={() => router.push("/forgot-password")}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Mode 2: Phone Number */}
            {authMode === "phone" && (
              <>
                <View style={styles.inputCard}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Palette.oceanTeal}
                    style={styles.inputLeadingIcon}
                  />
                  <View style={styles.inputDivider} />
                  {/* Country Code Badge */}
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                  </View>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter your mobile number"
                    placeholderTextColor={Palette.textMuted}
                    style={styles.textInput}
                    keyboardType="phone-pad"
                    selectionColor={Palette.oceanTeal}
                  />
                </View>
                <Text style={styles.phoneHintText}>
                  We will use your mobile number to sign you into your personal keepsake space.
                </Text>
              </>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Primary Submit Button */}
            <TouchableOpacity
              style={[styles.loginButtonWrapper, loading && { opacity: 0.7 }]}
              onPress={authMode === "email" ? handleEmailLogin : handlePhoneLogin}
              activeOpacity={0.88}
              disabled={loading}
            >
              <View style={styles.loginButton}>
                {loading ? (
                  <ActivityIndicator color={Palette.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {authMode === "email" ? "Login with Email" : "Continue with Phone"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Divider "Or continue with" */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with Google</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In with backend authentication */}
            <View style={styles.socialSection}>
              <TouchableOpacity
                onPress={() => handleGoogleLogin()}
                activeOpacity={0.84}
                style={styles.googleFullBtn}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                disabled={loading}
              >
                <GoogleLogo size={20} />
                <Text style={styles.googleFullBtnText}>Continue with Google</Text>
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
    backgroundColor: Palette.iceWhite,
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
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoImage: {
    width: 124,
    height: 96,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 6,
    fontFamily: AppFonts.displaySans,
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
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.1,
    fontFamily: AppFonts.body,
  },

  /* Form */
  formContainer: {
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
  },

  /* Mode Switcher Tabs */
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1C1C1C",
    borderRadius: 24,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#888888",
    fontFamily: AppFonts.body,
  },
  tabButtonTextActive: {
    color: "#000000",
    fontWeight: "800",
  },

  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: Palette.pureWhite,
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
  countryCodeBadge: {
    paddingRight: 8,
  },
  countryCodeText: {
    color: Palette.deepTeal,
    fontSize: 14.5,
    fontWeight: "700",
  },
  textInput: {
    flex: 1,
    color: Palette.deepTeal,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 0,
    fontFamily: AppFonts.body,
  },
  eyeToggle: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneHintText: {
    color: Palette.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 8,
    fontFamily: AppFonts.body,
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
    marginTop: -4,
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },

  /* Primary Button */
  loginButtonWrapper: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 18,
  },
  loginButton: {
    height: 54,
    backgroundColor: Palette.oceanTeal,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 16.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontFamily: AppFonts.displaySans,
  },

  /* Divider Row */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: Palette.textMuted,
    fontSize: 12,
    paddingHorizontal: 12,
    fontWeight: "600",
  },

  /* Social Logins */
  socialSection: {
    alignItems: "center",
    marginBottom: 22,
    gap: 10,
  },
  googleFullBtn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#18181B",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  googleFullBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  googleOtherBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  googleOtherBtnText: {
    color: Palette.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 22,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#181818",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Active Session Card */
  activeSessionCard: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#131316",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    marginBottom: 6,
  },
  activeSessionTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  activeSessionTitle: {
    color: "#D1D5DB",
    fontSize: 13.5,
    fontWeight: "500",
  },
  activeSessionSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  activeSessionBtns: {
    flexDirection: "row",
    gap: 8,
  },
  activeSessionContinueBtn: {
    flex: 1.2,
    backgroundColor: "rgba(34, 197, 94, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.4)",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  activeSessionContinueText: {
    color: "#4ADE80",
    fontSize: 12.5,
    fontWeight: "700",
  },
  activeSessionSignOutBtn: {
    flex: 1,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  activeSessionSignOutText: {
    color: "#F87171",
    fontSize: 12.5,
    fontWeight: "700",
  },

  /* Register link row */
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
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
