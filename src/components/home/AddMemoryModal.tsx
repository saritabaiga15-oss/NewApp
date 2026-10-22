import React, { useMemo } from "react";
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── Card data ────────────────────────────────────────────────────────────────

interface StudioCard {
  key: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Very subtle tint for the whole card */
  cardBg: string;
  /** Stronger tint for the icon box */
  iconBg: string;
  /** Accent used for icon, badge text, tagline, and arrow */
  accent: string;
}

const STUDIO_CARDS: StudioCard[] = [
  {
    key: "tribute",
    badge: "Honour",
    title: "A Tribute",
    tagline: "Celebrate someone special.",
    description:
      "Create a heartfelt tribute to a person who made a difference in your life.",
    icon: "heart",
    cardBg: "#F9E3E6",
    iconBg: "#F0BFC9",
    accent: "#8E1B34",
  },
  {
    key: "memory",
    badge: "Snapshot",
    title: "A Memory",
    tagline: "Keep a moment alive.",
    description:
      "Preserve a meaningful experience, photograph, or place you shared.",
    icon: "camera",
    cardBg: "#FDE9D5",
    iconBg: "#F5C898",
    accent: "#D9680F",
  },
  {
    key: "letter",
    badge: "Personal",
    title: "A Letter",
    tagline: "Say what matters.",
    description:
      "Write a personal letter expressing gratitude and appreciation.",
    icon: "mail",
    cardBg: "#F6E2E8",
    iconBg: "#EBBECB",
    accent: "#B04A66",
  },
  {
    key: "lesson",
    badge: "Wisdom",
    title: "A Life Lesson",
    tagline: "Save their wisdom.",
    description:
      "Capture valuable advice, meaningful quotes, and teachings.",
    icon: "bulb-outline",
    cardBg: "#F8EBCB",
    iconBg: "#EDCF88",
    accent: "#9A6A00",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddMemoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddMemoryModal({
  visible,
  onClose,
  onSelectOption,
}: AddMemoryModalProps) {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(80), []);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 62,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(80);
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSelect = (card: StudioCard) => {
    onSelectOption(card.key);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableWithoutFeedback>
          <View style={styles.sheet}>
            {/* Drag Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.sheetTitle}>
                  What Would You Like to Create?
                </Text>
                <Text style={styles.sheetSubtitle}>
                  Choose a canvas to capture someone meaningful
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={18} color="#7A4040" />
              </TouchableOpacity>
            </View>

            {/* 2×2 Grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContent}
            >
              <View style={styles.grid}>
                {STUDIO_CARDS.map((card) => (
                  <TouchableOpacity
                    key={card.key}
                    activeOpacity={0.8}
                    onPress={() => handleSelect(card)}
                    style={[styles.card, { backgroundColor: card.cardBg }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Create ${card.title}`}
                  >
                    {/* Top row: icon box + badge pill */}
                    <View style={styles.cardTop}>
                      <View
                        style={[styles.iconBox, { backgroundColor: card.iconBg }]}
                      >
                        <Ionicons
                          name={card.icon}
                          size={22}
                          color={card.accent}
                        />
                      </View>
                      <View style={styles.badgePill}>
                        <Text
                          style={[styles.badgeText, { color: card.accent }]}
                        >
                          {card.badge}
                        </Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.cardTitle}>{card.title}</Text>

                    {/* Tagline */}
                    <Text
                      style={[styles.cardTagline, { color: card.accent }]}
                    >
                      {card.tagline}
                    </Text>

                    {/* Description */}
                    <Text style={styles.cardDesc} numberOfLines={3}>
                      {card.description}
                    </Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Footer */}
                    <View style={styles.cardFooter}>
                      <Text
                        style={[styles.craftText, { color: "#1C0808" }]}
                      >
                        Craft this
                      </Text>
                      <View
                        style={[
                          styles.arrowCircle,
                          { backgroundColor: card.iconBg },
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color={card.accent}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(30, 0, 5, 0.45)",
  },
  sheetWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: "#FDF5EE",          // warm cream sheet
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    maxHeight: "92%",
    shadowColor: "#3D000A",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(84, 0, 14, 0.20)",
    alignSelf: "center",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C0808",
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: "#9A6060",
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(84, 0, 14, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  gridContent: {
    paddingBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: "47.5%",
    borderRadius: 20,
    padding: 14,
    // very light shadow so cards feel lifted off the cream background
    shadowColor: "#3D000A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    // subtle border to distinguish from sheet bg
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgePill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    // white pill with a very soft shadow so it reads cleanly
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C0808",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardTagline: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12.5,
    color: "#5A4040",
    lineHeight: 18,
    opacity: 0.9,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 12,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  craftText: {
    fontSize: 14,
    fontWeight: "700",
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
