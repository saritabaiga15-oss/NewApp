import React, { useMemo, useRef } from "react";
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
  const liftAnim = useMemo(() => new Animated.Value(0), []);
  const isHovered = useRef(false);
  const isPressed = useRef(false);

  const animateCard = (hovered: boolean, pressed: boolean) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressed ? 0.96 : hovered ? 1.025 : 1,
        useNativeDriver: true,
        speed: pressed ? 30 : 20,
        bounciness: pressed ? 3 : 5,
      }),
      Animated.spring(liftAnim, {
        toValue: pressed ? -5 : hovered ? -3 : 0,
        useNativeDriver: true,
        speed: pressed ? 30 : 20,
        bounciness: pressed ? 3 : 5,
      }),
    ]).start();
  };

  const handleHoverIn = () => {
    isHovered.current = true;
    animateCard(true, isPressed.current);
  };

  const handleHoverOut = () => {
    isHovered.current = false;
    animateCard(false, isPressed.current);
  };

  const handlePressIn = () => {
    isPressed.current = true;
    animateCard(isHovered.current, true);
  };

  const handlePressOut = () => {
    isPressed.current = false;
    animateCard(isHovered.current, false);
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
        { transform: [{ translateY: liftAnim }, { scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
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
      return { backgroundColor: "rgba(255, 158, 207, 0.14)" };
    case "memory":
      return { backgroundColor: "rgba(143, 211, 255, 0.14)" };
    case "letter":
      return { backgroundColor: "rgba(255, 184, 153, 0.14)" };
    case "lesson":
      return { backgroundColor: "rgba(255, 240, 154, 0.14)" };
    default:
      return { backgroundColor: Palette.mintMist };
  }
}

function getIconColor(type: string) {
  switch (type) {
    case "tribute":
      return Palette.accentPink;
    case "memory":
      return Palette.accentSky;
    case "letter":
      return Palette.accentPeach;
    case "lesson":
      return Palette.accentAmber;
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
    backgroundColor: Palette.surfaceCard,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
    minHeight: 188,
    justifyContent: "space-between",
  },
  cardActiveState: {
    borderColor: Palette.accentSky,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: Palette.surfaceCard,
  },

  // Bespoke styles per card
  tributeCard: {
    backgroundColor: Palette.surfaceCard,
    borderTopLeftRadius: 24,
    borderColor: Palette.borderSubtle,
  },
  memoryCard: {
    backgroundColor: Palette.surfaceCard,
    borderTopRightRadius: 24,
    borderColor: Palette.borderSubtle,
  },
  letterCard: {
    backgroundColor: Palette.surfaceCard,
    borderBottomLeftRadius: 24,
    borderColor: Palette.borderSubtle,
  },
  lessonCard: {
    backgroundColor: Palette.surfaceCard,
    borderBottomRightRadius: 24,
    borderColor: Palette.borderSubtle,
  },

  // Visual Accents per Card Type
  tributeRibbonTab: {
    position: "absolute",
    top: 0,
    left: 20,
    width: 14,
    height: 8,
    backgroundColor: Palette.accentPink,
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
    backgroundColor: "rgba(255, 158, 207, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  washiTapeStrip: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 32,
    height: 9,
    backgroundColor: "rgba(143, 211, 255, 0.14)",
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
    borderColor: "rgba(143, 211, 255, 0.45)",
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
    borderColor: "rgba(255, 184, 153, 0.45)",
    backgroundColor: "rgba(255, 184, 153, 0.08)",
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
    backgroundColor: Palette.accentAmber,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  quoteWatermark: {
    position: "absolute",
    top: -6,
    right: 6,
    fontSize: 52,
    fontWeight: "900",
    color: "rgba(255, 240, 154, 0.10)",
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
    backgroundColor: Palette.surfaceElevated,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillBadgeText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: Palette.textSecondary,
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
    borderTopColor: Palette.borderSubtle,
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
