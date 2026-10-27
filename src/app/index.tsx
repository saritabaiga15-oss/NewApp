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
import { router } from "expo-router";
import { Palette } from "@/constants/theme";

// Auto-navigate after this many ms (matches total animation + hold time)
const SPLASH_DURATION = 4200;

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);

  // Animations
  const logoOpacity   = useMemo(() => new Animated.Value(0), []);
  const logoScale     = useMemo(() => new Animated.Value(0.82), []);
  const contentFade   = useMemo(() => new Animated.Value(0), []);
  const contentSlide  = useMemo(() => new Animated.Value(18), []);
  const pill1Anim     = useMemo(() => new Animated.Value(0), []);
  const pill2Anim     = useMemo(() => new Animated.Value(0), []);
  const pill3Anim     = useMemo(() => new Animated.Value(0), []);
  const footerFade    = useMemo(() => new Animated.Value(0), []);
  const progressAnim  = useMemo(() => new Animated.Value(0), []);
  const glowAnim      = useMemo(() => new Animated.Value(0.6), []);
  // dot pulse for the three loading dots
  const dot1Anim      = useMemo(() => new Animated.Value(0.3), []);
  const dot2Anim      = useMemo(() => new Animated.Value(0.3), []);
  const dot3Anim      = useMemo(() => new Animated.Value(0.3), []);

  const navigateNext = React.useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace("/onboarding");
  }, []);

  useEffect(() => {
    // Orb ambient glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    glowLoop.start();

    // Sequenced entrance
    Animated.sequence([
      // 1. logo springs in
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, friction: 5, tension: 26, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      // 2. heading block rises
      Animated.parallel([
        Animated.timing(contentFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 3. pills stagger
      Animated.stagger(120, [
        Animated.timing(pill1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(pill2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(pill3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 4. footer text + dots
      Animated.timing(footerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Progress bar over full splash duration (no native driver — uses width %)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SPLASH_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => navigateNext());

    // Dot bounce loop
    const dotLoop = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1Anim, { toValue: 1,   duration: 350, useNativeDriver: true }),
          Animated.timing(dot1Anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2Anim, { toValue: 1,   duration: 350, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3Anim, { toValue: 1,   duration: 350, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      ])
    );
    dotLoop.start();

    return () => {
      glowLoop.stop();
      dotLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top + 16, 44) }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Decorative background orbs ── */}
      <Animated.View style={[styles.orbTopRight, { opacity: glowAnim }]} />
      <View style={styles.orbMidLeft} />

      {/* ══════════════════════════════════════
          1.  LOGO  — no circle halo behind it
          ══════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.logoSection,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require("../../assets/images/logo_transparent.png")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ══════════════════════════════════════
          2.  HEADING  honour / Your Mentor.
          ══════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.headingSection,
          { opacity: contentFade, transform: [{ translateY: contentSlide }] },
        ]}
      >
        <Text style={styles.eyebrow}>honour</Text>

        <View style={styles.titleRow}>
          <Text style={styles.titleMain}>
            Your Mentor<Text style={styles.titleDot}>.</Text>
          </Text>
          <Text style={styles.floatDots}> · ·</Text>
        </View>

        <View style={styles.accentBar} />

        <Text style={styles.tagline}>
          Celebrate the mentors, teachers, and guides{"\n"}
          who helped you become who you are.
        </Text>
      </Animated.View>

      {/* ══════════════════════════════════════
          3.  FEATURE PILLS
          ══════════════════════════════════════ */}
      <View style={styles.pillRow}>
        <Animated.View style={{ opacity: pill1Anim }}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>🕯</Text>
            <Text style={styles.pillText}>Remember</Text>
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: pill2Anim }}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>✦</Text>
            <Text style={styles.pillText}>Appreciate</Text>
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: pill3Anim }}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>♥</Text>
            <Text style={styles.pillText}>Preserve</Text>
          </View>
        </Animated.View>
      </View>

      {/* ══════════════════════════════════════
          4.  FOOTER  — "Begin your wall" text
              + animated dots + progress bar
          ══════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom + 24, 40),
            opacity: footerFade,
          },
        ]}
      >
        {/* "Begin your wall" as styled label, not a button */}
        <View style={styles.beginRow}>
          <Text style={styles.beginLabel}>Begin your wall</Text>
          {/* Animated loading dots */}
          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
          </View>
        </View>

        {/* Thin progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },

  // ── Decorative orbs ─────────────────────────────────────────────────────
  orbTopRight: {
    position: "absolute",
    top: -55,
    right: -72,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: "rgba(143, 211, 255, 0.06)",
  },
  orbMidLeft: {
    position: "absolute",
    top: "36%",
    left: -95,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 158, 207, 0.04)",
  },

  // ── Logo (no halo) ───────────────────────────────────────────────────────
  logoSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  logoImg: {
    width: 128,
    height: 128,
  },

  // ── Heading ─────────────────────────────────────────────────────────────
  headingSection: {
    alignItems: "center",
    width: "100%",
  },
  eyebrow: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    fontStyle: "italic",
    fontSize: 30,
    fontWeight: "600",
    color: Palette.accentSky,
    letterSpacing: 0.3,
    marginBottom: 4,
    lineHeight: 38,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  titleMain: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    fontSize: 44,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -1,
    lineHeight: 52,
  },
  titleDot: {
    color: Palette.accentSky,
  },
  floatDots: {
    fontSize: 22,
    color: Palette.accentSky,
    marginBottom: 8,
    marginLeft: 2,
    opacity: 0.55,
    lineHeight: 52,
  },
  accentBar: {
    width: 52,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Palette.accentSky,
    marginTop: 14,
    marginBottom: 20,
  },
  tagline: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    fontStyle: "italic",
    fontSize: 16.5,
    lineHeight: 26,
    color: Palette.textSecondary,
    textAlign: "center",
    letterSpacing: 0.1,
    paddingHorizontal: 8,
  },

  // ── Pills ────────────────────────────────────────────────────────────────
  pillRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    width: "100%",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 26,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 3,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  pillIcon: {
    fontSize: 14,
    color: Palette.accentSky,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.textPrimary,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  beginRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  beginLabel: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    fontStyle: "italic",
    fontSize: 17,
    fontWeight: "600",
    color: Palette.textSecondary,
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C07A18",
  },
  progressTrack: {
    width: "60%",
    height: 3,
    backgroundColor: Palette.borderSubtle,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Palette.accentSky,
    borderRadius: 2,
  },
});
