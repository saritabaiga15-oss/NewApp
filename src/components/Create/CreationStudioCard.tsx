import React, { useMemo } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { CreationOptionItem } from "@/types/create";

interface CreationStudioCardProps {
  item: CreationOptionItem;
  isSelected?: boolean;
  onPress: () => void;
}

export default function CreationStudioCard({
  item,
  isSelected,
  onPress,
}: CreationStudioCardProps) {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  // Render specific decorative detail per creation type
  const renderCardDecors = () => {
    switch (item.id) {
      case "tribute":
        return (
          <>
            {/* Top Ribbon Seal Accent */}
            <View style={styles.tributeRibbonTab}>
              <View style={styles.ribbonTail} />
            </View>
            {/* Wax Seal Micro-Emblem */}
            <View style={styles.waxSealEmblem}>
              <Ionicons name="sparkles" size={10} color={Palette.turquoise} />
            </View>
          </>
        );

      case "memory":
        return (
          <>
            {/* Washi Tape Strip on Polaroid corner */}
            <View style={styles.washiTapeStrip} />
            {/* Viewfinder Corner Brackets */}
            <View style={styles.viewfinderCorner} />
          </>
        );

      case "letter":
        return (
          <>
            {/* Postage Stamp Accent in corner */}
            <View style={styles.postageStamp}>
              <Ionicons name="paper-plane" size={9} color={Palette.textSecondary} />
            </View>
            {/* Ruled Paper Horizontal Lines Hint */}
            <View style={styles.ruledLinesWrap} pointerEvents="none">
              <View style={styles.ruledLine} />
              <View style={styles.ruledLine} />
              <View style={styles.ruledLine} />
            </View>
          </>
        );

      case "lesson":
        return (
          <>
            {/* Golden Bookmark Ribbon extending at bottom */}
            <View style={styles.lessonBookmarkRibbon} />
            {/* Quotation Watermark */}
            <Text style={styles.quoteWatermark} pointerEvents="none">
              “
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.cardInner,
          getSpecificCardStyle(item.id),
          (isSelected || pressed) && styles.cardActiveState,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}: ${item.subtitle}`}
        accessibilityHint={item.purpose}
      >
        {/* Type-specific decorative accents */}
        {renderCardDecors()}

        {/* Top Meta Row: Badge & Icon */}
        <View style={styles.topMetaRow}>
          <View
            style={[
              styles.iconWrapper,
              getIconWrapperStyle(item.id),
            ]}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={getIconColor(item.id)}
            />
          </View>

          {/* Micro-pill badge */}
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>{item.badgeLabel}</Text>
          </View>
        </View>

        {/* Typography Content */}
        <View style={styles.contentWrap}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          <Text style={styles.cardPurpose} numberOfLines={2}>
            {item.purpose}
          </Text>
        </View>

        {/* Bottom Action Hint */}
        <View style={styles.bottomActionRow}>
          <Text style={styles.startActionText}>Craft this</Text>
          <View style={styles.actionArrowCircle}>
            <Ionicons name="arrow-forward" size={11} color={Palette.deepTeal} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getSpecificCardStyle(type: string) {
  switch (type) {
    case "tribute":
      return styles.tributeCard;
    case "memory":
      return styles.memoryCard;
    case "letter":
      return styles.letterCard;
    case "lesson":
      return styles.lessonCard;
    default:
      return {};
  }
}

function getIconWrapperStyle(type: string) {
  switch (type) {
    case "tribute":
      return { backgroundColor: "rgba(84, 0, 14, 0.08)" };
    case "memory":
      return { backgroundColor: "rgba(236, 143, 62, 0.15)" };
    case "letter":
      return { backgroundColor: "rgba(158, 42, 43, 0.10)" };
    case "lesson":
      return { backgroundColor: "rgba(184, 98, 27, 0.14)" };
    default:
      return { backgroundColor: Palette.mintMist };
  }
}

function getIconColor(type: string) {
  switch (type) {
    case "tribute":
      return Palette.oceanTeal;
    case "memory":
      return Palette.turquoise;
    case "letter":
      return "#9E2A2B";
    case "lesson":
      return "#B8621B";
    default:
      return Palette.deepTeal;
  }
}

const styles = StyleSheet.create({
  cardOuter: {
    width: "48.2%",
    marginBottom: 14,
  },
  cardInner: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
    minHeight: 188,
    justifyContent: "space-between",
  },
  cardActiveState: {
    borderColor: Palette.turquoise,
    shadowColor: Palette.turquoise,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
    backgroundColor: "#FFFCF9",
  },

  // Bespoke styles per card
  tributeCard: {
    backgroundColor: "#FFF9F5",
    borderTopLeftRadius: 24,
    borderColor: "rgba(84, 0, 14, 0.15)",
  },
  memoryCard: {
    backgroundColor: Palette.pureWhite,
    borderTopRightRadius: 24,
    borderColor: "rgba(236, 143, 62, 0.25)",
  },
  letterCard: {
    backgroundColor: "#FFFDF9",
    borderBottomLeftRadius: 24,
    borderColor: "rgba(158, 42, 43, 0.16)",
  },
  lessonCard: {
    backgroundColor: "#FFFAF2",
    borderBottomRightRadius: 24,
    borderColor: "rgba(184, 98, 27, 0.22)",
  },

  // Visual Accents per Card Type
  tributeRibbonTab: {
    position: "absolute",
    top: 0,
    left: 20,
    width: 14,
    height: 8,
    backgroundColor: Palette.oceanTeal,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  ribbonTail: {
    position: "absolute",
    bottom: -3,
    left: 4,
    width: 6,
    height: 3,
    backgroundColor: Palette.turquoise,
  },
  waxSealEmblem: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(236, 143, 62, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  washiTapeStrip: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 32,
    height: 9,
    backgroundColor: "rgba(236, 143, 62, 0.28)",
    transform: [{ rotate: "14deg" }],
    borderRadius: 1,
  },
  viewfinderCorner: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 8,
    height: 8,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "rgba(236, 143, 62, 0.4)",
  },

  postageStamp: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(158, 42, 43, 0.35)",
    backgroundColor: "rgba(252, 238, 228, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  ruledLinesWrap: {
    position: "absolute",
    top: 48,
    left: 14,
    right: 14,
    opacity: 0.15,
  },
  ruledLine: {
    height: 1,
    backgroundColor: Palette.oceanTeal,
    marginBottom: 8,
  },

  lessonBookmarkRibbon: {
    position: "absolute",
    bottom: 0,
    right: 22,
    width: 12,
    height: 7,
    backgroundColor: Palette.turquoise,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  quoteWatermark: {
    position: "absolute",
    top: -6,
    right: 6,
    fontSize: 52,
    fontWeight: "900",
    color: "rgba(236, 143, 62, 0.10)",
    fontFamily: "serif",
  },

  // Common Header & Meta
  topMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    zIndex: 2,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pillBadge: {
    backgroundColor: "rgba(84, 0, 14, 0.05)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillBadgeText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 0.8,
  },

  // Content
  contentWrap: {
    zIndex: 2,
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.turquoise,
    marginTop: 2,
    marginBottom: 4,
  },
  cardPurpose: {
    fontSize: 11,
    color: Palette.textSecondary,
    lineHeight: 15,
  },

  // Bottom action row
  bottomActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(177, 167, 166, 0.18)",
    zIndex: 2,
  },
  startActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  actionArrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
  },
});
