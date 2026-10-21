import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface CreateHeaderProps {
  draftCount?: number;
}

export default function CreateHeader({ draftCount = 0 }: CreateHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Top Studio Badge Row */}
      <View style={styles.topRow}>
        <View style={styles.studioPill}>
          <View style={styles.nibCircle}>
            <Ionicons name="sparkles" size={12} color={Palette.turquoise} />
          </View>
          <Text style={styles.studioPillText}>MEMORY STUDIO</Text>
        </View>

        {/* Decorative subtle note / seal icon badge */}
        <View style={styles.stationerySeal}>
          <Ionicons name="journal-outline" size={14} color={Palette.oceanTeal} />
          {draftCount > 0 && (
            <View style={styles.sealDot}>
              <Text style={styles.sealDotText}>{draftCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Header Content */}
      <View style={styles.titleArea}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Let&apos;s celebrate someone.</Text>
          {/* Handwritten ink feather accent */}
          <View style={styles.quillIconWrap}>
            <Ionicons name="pencil" size={16} color={Palette.turquoise} />
          </View>
        </View>
        <Text style={styles.subtitle}>Every memory deserves a place to live.</Text>
      </View>

      {/* Delicate horizontal deckle line with warm accent */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerDiamond} />
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  studioPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.28)",
  },
  nibCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(236, 143, 62, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  studioPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1.1,
  },
  stationerySeal: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.pureWhite,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  sealDot: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: Palette.turquoise,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  sealDotText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  titleArea: {
    marginTop: 2,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 27,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.6,
    flex: 1,
  },
  quillIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(236, 143, 62, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: Palette.textSecondary,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(177, 167, 166, 0.35)",
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: Palette.turquoise,
    transform: [{ rotate: "45deg" }],
    borderRadius: 1,
  },
});
