import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts, Palette } from "@/constants/theme";

interface AnniversaryCardProps {
  onWriteThanksPress?: () => void;
}

export default function AnniversaryCard({ onWriteThanksPress }: AnniversaryCardProps) {
  return (
    <View style={styles.card}>
      {/* Ambient decorative glow */}
      <View style={styles.glowCircle} />

      {/* Pill Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Anniversary</Text>
      </View>

      {/* Headline */}
      <Text style={styles.title}>
        10 years ago this month, Mrs. Sharma became your teacher.
      </Text>

      {/* Bottom Row: Avatar and Action */}
      <View style={styles.bottomRow}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onWriteThanksPress}
          activeOpacity={0.85}
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel="Write a thank-you to Mrs. Sharma"
        >
          <Text style={styles.ctaText}>Write a thank-you</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
  glowCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(196, 167, 255, 0.08)",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 240, 154, 0.16)",
    paddingHorizontal: 14,
    paddingVertical: 4.5,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    color: Palette.accentAmber,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: "700",
    color: Palette.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.2,
    marginBottom: 18,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  ctaButton: {
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.textOnPrimary,
  },
});
