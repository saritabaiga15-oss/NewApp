import { Palette } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);

  // Animations
  const bgAnim      = useMemo(() => new Animated.Value(0), []);
  const logoScale   = useMemo(() => new Animated.Value(0.7), []);
  const logoOpacity = useMemo(() => new Animated.Value(0), []);
  const floatAnim   = useMemo(() => new Animated.Value(0), []);
  const glowAnim    = useMemo(() => new Animated.Value(0.4), []);
  const titleOpacity = useMemo(() => new Animated.Value(0), []);
  const titleSlide  = useMemo(() => new Animated.Value(24), []);
  const lineWidth   = useMemo(() => new Animated.Value(0), []);
  const tagOpacity  = useMemo(() => new Animated.Value(0), []);
  const tagSlide    = useMemo(() => new Animated.Value(16), []);
  const pill1Opacity = useMemo(() => new Animated.Value(0), []);
  const pill2Opacity = useMemo(() => new Animated.Value(0), []);
  const pill3Opacity = useMemo(() => new Animated.Value(0), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);
  const progressWidth = useMemo(() => new Animated.Value(0), []);

  const navigateNext = React.useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace("/onboarding");
  }, []);

  useEffect(() => {
    // Gentle float loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -9, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    // Glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    floatLoop.start();
    glowLoop.start();

    // Total entrance sequence duration:
    // bgAnim: 700ms
    // logo: ~1200ms (spring)
    // title: 900ms
    // lineWidth: 700ms
    // tagline: 900ms
    // pills stagger: 120*2 + 600 = 840ms
    // footer: 600ms
    // hold: 1500ms
    // ≈ ~7340ms total before navigate

    // Entrance sequence — navigate ONLY after all animations complete
    Animated.sequence([
      Animated.timing(bgAnim, { toValue: 1, duration: 700, useNativeDriver: true }),

      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 28, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),

      Animated.timing(lineWidth, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),

      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(tagSlide, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),

      // Stagger the 3 bottom pills
      Animated.stagger(200, [
        Animated.timing(pill1Opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pill2Opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pill3Opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),

      Animated.timing(footerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),

      // Hold so user can read all content
      Animated.delay(1800),
    ]).start(() => {
      // Navigate only after every animation has finished
      navigateNext();
    });

    // Progress bar matches full sequence duration (~8000ms)
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 8000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    return () => {
      floatLoop.stop();
      glowLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Rich warm gradient background */}
      <LinearGradient
        colors={["#FFF8F0", "#FCEEE4", "#FFF4ED", "#FFF8F0"]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative top-right amber orb */}
      <Animated.View style={[styles.orbTopRight, { opacity: glowAnim }]} />

      {/* Decorative bottom-left crimson orb */}
      <Animated.View style={[styles.orbBottomLeft, { opacity: glowAnim }]} />

      {/* Horizontal accent bar at very top */}
      <View style={[styles.topAccentBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.topAccentLine} />
      </View>

      {/* ===== CENTER STAGE ===== */}
      <View style={styles.centerStage}>

        {/* Logo with glow halo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { translateY: floatAnim }],
            },
          ]}
        >
          {/* Outer ambient glow ring */}
          <Animated.View style={[styles.glowRingOuter, { opacity: glowAnim }]} />
          <Animated.View style={[styles.glowRingInner, { opacity: glowAnim }]} />

          <Image
            source={require("../../assets/images/logo_transparent.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title block */}
        <Animated.View
          style={[
            styles.titleBlock,
            { opacity: titleOpacity, transform: [{ translateY: titleSlide }] },
          ]}
        >
          <Text style={styles.titleEyebrow}>✦  H O N O U R  ✦</Text>
          <Text style={styles.titleMain}>
            YOUR MENTOR<Text style={styles.titleDot}>.</Text>
          </Text>
        </Animated.View>

        {/* Animated accent line */}
        <Animated.View
          style={[styles.accentLine, { transform: [{ scaleX: lineWidth }] }]}
        />

        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineBlock,
            { opacity: tagOpacity, transform: [{ translateY: tagSlide }] },
          ]}
        >
          <Text style={styles.taglineQuote}>❝</Text>
          <Text style={styles.taglineText}>
            People who shaped you deserve{"\n"}to be remembered.
          </Text>
        </Animated.View>

        {/* Feature pills */}
        <View style={styles.pillRow}>
          <Animated.View style={[styles.pill, { opacity: pill1Opacity }]}>
            <Text style={styles.pillEmoji}>🕯️</Text>
            <Text style={styles.pillText}>Remember</Text>
          </Animated.View>
          <Animated.View style={[styles.pill, { opacity: pill2Opacity }]}>
            <Text style={styles.pillEmoji}>🌟</Text>
            <Text style={styles.pillText}>Appreciate</Text>
          </Animated.View>
          <Animated.View style={[styles.pill, { opacity: pill3Opacity }]}>
            <Text style={styles.pillEmoji}>💛</Text>
            <Text style={styles.pillText}>Preserve</Text>
          </Animated.View>
        </View>
      </View>

      {/* ===== FOOTER ===== */}
      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 32),
            opacity: footerOpacity,
          },
        ]}
      >
        {/* Loading progress */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressInterpolate }]}
          />
          {/* Glow head */}
          <Animated.View
            style={[
              styles.progressGlow,
              { left: progressInterpolate },
            ]}
          />
        </View>

        <Text style={styles.footerBrand}>HONOUR YOUR MENTOR</Text>
        <Text style={styles.footerSub}>Loading your experience…</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    justifyContent: "space-between",
  },

  /* Decorative orbs */
  orbTopRight: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(236, 143, 62, 0.18)",
  },
  orbBottomLeft: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(84, 0, 14, 0.08)",
  },

  /* Top accent bar */
  topAccentBar: {
    paddingHorizontal: 28,
    alignItems: "flex-start",
  },
  topAccentLine: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: Palette.oceanTeal,
    opacity: 0.5,
  },

  /* Center stage */
  centerStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: -20,
  },

  /* Logo */
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  glowRingOuter: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(236, 143, 62, 0.08)",
  },
  glowRingInner: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(236, 143, 62, 0.10)",
  },
  logoImage: {
    width: 128,
    height: 128,
  },

  /* Title */
  titleBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  titleEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 4,
    color: Palette.turquoise,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  titleMain: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 2.5,
    color: Palette.deepTeal,
    textAlign: "center",
    textTransform: "uppercase",
  },
  titleDot: {
    color: Palette.turquoise,
  },

  /* Accent line */
  accentLine: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: Palette.turquoise,
    marginBottom: 24,
  },

  /* Tagline */
  taglineBlock: {
    alignItems: "center",
    marginBottom: 36,
    paddingHorizontal: 16,
  },
  taglineQuote: {
    fontSize: 32,
    color: Palette.turquoise,
    opacity: 0.5,
    lineHeight: 36,
    marginBottom: 4,
  },
  taglineText: {
    fontSize: 15.5,
    lineHeight: 26,
    color: Palette.deepTeal,
    opacity: 0.75,
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: 0.15,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  },

  /* Feature pills */
  pillRow: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(84, 0, 14, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  pillEmoji: {
    fontSize: 13,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.deepTeal,
    letterSpacing: 0.2,
  },

  /* Footer */
  footer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  progressTrack: {
    width: 120,
    height: 3,
    backgroundColor: "rgba(84, 0, 14, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Palette.oceanTeal,
    borderRadius: 2,
  },
  progressGlow: {
    position: "absolute",
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.turquoise,
    shadowColor: Palette.turquoise,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  footerBrand: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    color: Palette.deepTeal,
    opacity: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  footerSub: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
