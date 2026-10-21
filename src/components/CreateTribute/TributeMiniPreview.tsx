import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { TributeRelationship } from "@/types/create";

interface TributeMiniPreviewProps {
  name: string;
  relationship: TributeRelationship;
  photoUri: string;
  story: string;
}

export default function TributeMiniPreview({
  name,
  relationship,
  photoUri,
  story,
}: TributeMiniPreviewProps) {
  const displayName = name.trim() || "Dr. Evelyn Reed";
  const displayQuote = story.trim()
    ? `“${story.slice(0, 110).trim()}${story.length > 110 ? "…" : ""}”`
    : "“Thank you for believing in me before I believed in myself.”";

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name="eye-outline" size={13} color={Palette.turquoise} />
          <Text style={styles.editorialLabel}>STUDIO PREVIEW</Text>
        </View>
        <Text style={styles.heading}>Your memories, beautifully kept.</Text>
        <Text style={styles.subtitle}>
          A live glimpse of how your tribute will look in your keepsake collection
        </Text>
      </View>

      {/* Keepsake Mini Frame */}
      <View style={styles.frameContainer}>
        {/* Decorative Tape Strip */}
        <View style={styles.vintageTape} />

        <View style={styles.innerCard}>
          {/* Top Row: Photo + Name/Role */}
          <View style={styles.topInfoRow}>
            <View style={styles.photoMount}>
              <Image
                source={{ uri: photoUri }}
                style={styles.portrait}
                resizeMode="cover"
              />
              <View style={styles.photoCorner} />
            </View>

            <View style={styles.textColumn}>
              <View style={styles.roleBadge}>
                <Ionicons name="sparkles" size={10} color={Palette.turquoise} />
                <Text style={styles.roleBadgeText}>
                  {relationship.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.mentorName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.dedicatedTo}>In profound gratitude</Text>
            </View>
          </View>

          {/* Quote Block */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>{displayQuote}</Text>
          </View>

          {/* Bottom Seal & Verification */}
          <View style={styles.cardFooter}>
            <View style={styles.sealEmblem}>
              <Ionicons name="heart" size={12} color={Palette.oceanTeal} />
              <Text style={styles.sealText}>HONOURED</Text>
            </View>
            <Text style={styles.previewIndicator}>Live Example Preview</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  editorialLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1.1,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  frameContainer: {
    position: "relative",
    paddingTop: 6,
  },
  vintageTape: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: 60,
    height: 12,
    backgroundColor: "rgba(236, 143, 62, 0.3)",
    borderRadius: 2,
    zIndex: 3,
  },
  innerCard: {
    backgroundColor: "#FFFDF9",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(236, 143, 62, 0.35)",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  topInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  photoMount: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: Palette.mintMist,
    padding: 3,
    borderWidth: 1.2,
    borderColor: "rgba(236, 143, 62, 0.35)",
    position: "relative",
  },
  portrait: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  photoCorner: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Palette.turquoise,
    borderRadius: 2,
  },
  textColumn: {
    flex: 1,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 0.8,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: "900",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
  },
  dedicatedTo: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  quoteBox: {
    backgroundColor: "rgba(252, 238, 228, 0.55)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(177, 167, 166, 0.25)",
  },
  quoteText: {
    fontSize: 13,
    fontStyle: "italic",
    color: Palette.deepTeal,
    lineHeight: 18,
    fontFamily: "serif",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(177, 167, 166, 0.18)",
  },
  sealEmblem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sealText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1,
  },
  previewIndicator: {
    fontSize: 10.5,
    color: Palette.textMuted,
    fontStyle: "italic",
  },
});
