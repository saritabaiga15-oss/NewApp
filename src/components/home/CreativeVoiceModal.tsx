import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";

interface CreativeVoiceModalProps {
  visible: boolean;
  onClose: () => void;
  voiceNote?: {
    title: string;
    mentorName: string;
    duration: string;
    date?: string;
    description?: string;
    transcript?: string;
    audioUri?: string;
  } | null;
  mode?: "listen" | "record";
}

// Bar heights for the waveform — 9 bars matching the screenshot
const WAVEFORM_HEIGHTS = [38, 60, 80, 100, 116, 100, 80, 60, 38];

export default function CreativeVoiceModal({
  visible,
  onClose,
  voiceNote,
  mode = "listen",
}: CreativeVoiceModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  // One Animated.Value per bar
  const barAnims = useMemo(
    () => WAVEFORM_HEIGHTS.map((h) => new Animated.Value(h * 0.35)),
    []
  );

  // Pulse ring around the play button
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    if (!visible) return;

    // --- Waveform bar animations ---
    const loops = barAnims.map((anim, i) => {
      const minH = WAVEFORM_HEIGHTS[i] * 0.28;
      const maxH = WAVEFORM_HEIGHTS[i];
      const duration = 420 + i * 90; // stagger each bar

      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxH,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: minH,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    });

    // --- Pulse ring animation ---
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.22,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    loops.forEach((l) => l.start());
    pulseLoop.start();

    return () => {
      loops.forEach((l) => l.stop());
      pulseLoop.stop();
    };
  }, [visible, barAnims, pulseAnim]);

  // Pause / resume waveform when playing state changes
  useEffect(() => {
    if (!visible) return;
    if (!isPlaying) {
      barAnims.forEach((anim, i) =>
        Animated.timing(anim, {
          toValue: WAVEFORM_HEIGHTS[i] * 0.28,
          duration: 180,
          useNativeDriver: false,
        }).start()
      );
    }
  }, [isPlaying, barAnims, visible]);

  const displayTranscript =
    voiceNote?.description ||
    voiceNote?.transcript ||
    voiceNote?.title ||
    "A voice memo recorded to keep you grounded on the path.";

  const mentorDisplayName = voiceNote?.mentorName || "";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onShow={() => setIsPlaying(true)}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* ── TOP NAV BAR ── */}
        <View style={styles.topBar}>
          {/* Back arrow */}
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Close voice note"
          >
            <Ionicons name="arrow-back" size={20} color={Palette.textPrimary} />
          </TouchableOpacity>

          {/* Options */}
          <TouchableOpacity
            style={styles.circleBtn}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── STATUS & MENTOR LABEL ── */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>
            {isPlaying ? "Listening..." : "Paused"}
          </Text>
          {!!mentorDisplayName && (
            <Text style={styles.mentorLabel}>{mentorDisplayName}</Text>
          )}
        </View>

        {/* ── ANIMATED WAVEFORM ── */}
        <View style={styles.waveformSection}>
          <View style={styles.waveformRow}>
            {barAnims.map((anim, idx) => (
              <Animated.View
                key={`bar-${idx}`}
                style={[
                  styles.waveBar,
                  {
                    height: isPlaying ? anim : WAVEFORM_HEIGHTS[idx] * 0.28,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── TRANSCRIPT / QUOTE TEXT ── */}
        <View style={styles.transcriptSection}>
          <Text style={styles.transcriptText}>
            &ldquo;{displayTranscript}&rdquo;
          </Text>
        </View>

        {/* ── BOTTOM CONTROL DOCK ── */}
        <View style={styles.bottomDock}>
          {/* Left: Monitor / Keyboard icon */}
          <TouchableOpacity
            style={styles.circleBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Keyboard input"
          >
            <Ionicons name="tv-outline" size={22} color={Palette.deepTeal} />
          </TouchableOpacity>

          {/* Center: Main play/pause button with pulse ring */}
          <View style={styles.mainBtnWrap}>
            {/* Outer pulse ring */}
            <Animated.View
              style={[
                styles.pulseRingOuter,
                { transform: [{ scale: isPlaying ? pulseAnim : 1 }] },
              ]}
            />
            {/* Inner softer ring */}
            <Animated.View
              style={[
                styles.pulseRingInner,
                { transform: [{ scale: isPlaying ? pulseAnim : 1 }] },
              ]}
            />
            {/* Button */}
            <TouchableOpacity
              style={styles.mainBtn}
              activeOpacity={0.85}
              onPress={() => setIsPlaying((p) => !p)}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? "Pause voice note" : "Play voice note"}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={30}
                color={Palette.textOnPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Right: Close X */}
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
    paddingTop: Platform.select({ ios: 60, android: 48, default: 48 }),
    paddingBottom: Platform.select({ ios: 40, android: 28, default: 28 }),
    paddingHorizontal: 28,
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* Top Nav */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Status */
  statusSection: {
    alignItems: "center",
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
    letterSpacing: 0.1,
  },
  mentorLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: Palette.accentSky,
    marginTop: 5,
  },

  /* Waveform */
  waveformSection: {
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.18,
    width: "100%",
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: "100%",
  },
  waveBar: {
    width: 14,
    borderRadius: 8,
    backgroundColor: Palette.accentSky,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  /* Transcript */
  transcriptSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  transcriptText: {
    fontSize: 22,
    lineHeight: 34,
    textAlign: "center",
    color: Palette.textPrimary,
    fontWeight: "500",
    letterSpacing: -0.1,
    fontFamily: AppFonts.body,
  },

  /* Bottom Dock */
  bottomDock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },

  /* Main Play/Pause Button */
  mainBtnWrap: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    position: "relative",
  },
  pulseRingOuter: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(143, 211, 255, 0.06)",
  },
  pulseRingInner: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(143, 211, 255, 0.1)",
  },
  mainBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.oceanTeal,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
});
