import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface WallHeaderProps {
  totalItems: number;
  pinnedCount: number;
  onSearchPress: () => void;
  onSortPress: () => void;
}

export default function WallHeader({
  totalItems,
  pinnedCount,
  onSearchPress,
  onSortPress,
}: WallHeaderProps) {
  return (
    <LinearGradient
      colors={[Palette.deepTeal, "#3A0009"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative glow orbs */}
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <View style={styles.iconBadge}>
            <Ionicons name="library" size={16} color={Palette.turquoise} />
          </View>
          <Text style={styles.screenLabel}>Memory Wall</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onSearchPress}
            style={styles.iconBtn}
            activeOpacity={0.75}
            accessibilityLabel="Search memories"
            accessibilityRole="button"
          >
            <Ionicons name="search-outline" size={20} color="rgba(252,238,228,0.85)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSortPress}
            style={styles.iconBtn}
            activeOpacity={0.75}
            accessibilityLabel="Sort memories"
            accessibilityRole="button"
          >
            <Ionicons name="options-outline" size={20} color="rgba(252,238,228,0.85)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero headline */}
      <View style={styles.heroArea}>
        <Text style={styles.headline}>Your Personal</Text>
        <Text style={styles.headlineAccent}>Archive</Text>
        <Text style={styles.subline}>
          Every tribute, memory, and lesson that shaped who you are.
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Text style={styles.statNumber}>{pinnedCount}</Text>
          <Text style={styles.statLabel}>Pinned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Ionicons name="heart" size={14} color={Palette.turquoise} />
          <Text style={[styles.statLabel, { marginLeft: 4 }]}>Curated</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: "hidden",
    position: "relative",
  },
  glowOrb1: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(236,143,62,0.12)",
  },
  glowOrb2: {
    position: "absolute",
    bottom: -20,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(158,42,43,0.18)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  titleArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(236,143,62,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(236,143,62,0.35)",
  },
  screenLabel: {
    color: "rgba(252,238,228,0.75)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(252,238,228,0.12)",
  },
  heroArea: {
    marginBottom: 20,
  },
  headline: {
    fontSize: 32,
    fontWeight: "300",
    color: "rgba(252,238,228,0.75)",
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  headlineAccent: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFF8F0",
    letterSpacing: -0.5,
    lineHeight: 48,
    marginBottom: 8,
  },
  subline: {
    fontSize: 14,
    color: "rgba(252,238,228,0.6)",
    lineHeight: 20,
    maxWidth: 260,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(252,238,228,0.1)",
  },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.turquoise,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(252,238,228,0.6)",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(252,238,228,0.12)",
  },
});
