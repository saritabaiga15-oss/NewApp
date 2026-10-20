import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { FeelingPromptItem, FeelingThemeId } from "@/types/story";

interface FeelingPromptsProps {
  prompts: FeelingPromptItem[];
  selectedThemeId?: FeelingThemeId;
  onSelectTheme: (id: FeelingThemeId) => void;
}

export default function FeelingPrompts({
  prompts,
  selectedThemeId,
  onSelectTheme,
}: FeelingPromptsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>What Would You Like to Find Today?</Text>
          <Text style={styles.subheading}>
            Explore stories guided by human emotion and memory
          </Text>
        </View>
        {selectedThemeId && (
          <TouchableOpacity
            onPress={() => onSelectTheme(selectedThemeId)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.resetText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        {prompts.map((prompt) => {
          const isSelected = selectedThemeId === prompt.id;
          return (
            <TouchableOpacity
              key={prompt.id}
              onPress={() => onSelectTheme(prompt.id)}
              activeOpacity={0.82}
              style={[
                styles.card,
                isSelected ? styles.cardSelected : styles.cardUnselected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select theme: ${prompt.title}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconCircle,
                    isSelected ? styles.iconCircleSelected : styles.iconCircleUnselected,
                  ]}
                >
                  <Ionicons
                    name={prompt.iconName as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={isSelected ? Palette.pureWhite : Palette.turquoise}
                  />
                </View>

                {isSelected && (
                  <View style={styles.activeCheckPill}>
                    <Ionicons name="checkmark" size={12} color={Palette.pureWhite} />
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.title,
                  isSelected ? styles.titleSelected : styles.titleUnselected,
                ]}
                numberOfLines={2}
              >
                &ldquo;{prompt.title}&rdquo;
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  isSelected ? styles.subtitleSelected : styles.subtitleUnselected,
                ]}
                numberOfLines={2}
              >
                {prompt.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  heading: {
    fontSize: 19,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 3,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.turquoise,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 18,
    padding: 14,
    minHeight: 130,
    justifyContent: "space-between",
    borderWidth: 1.2,
  },
  cardUnselected: {
    backgroundColor: Palette.mintMist, // Soft Mint Mist background
    borderColor: "rgba(236, 143, 62, 0.22)",
    shadowColor: Palette.deepTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: Palette.oceanTeal, // Ocean Teal when active
    borderColor: Palette.oceanTeal,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleUnselected: {
    backgroundColor: Palette.pureWhite,
  },
  iconCircleSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  activeCheckPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.turquoise,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 13.5,
    fontWeight: "800",
    lineHeight: 18,
    marginBottom: 4,
  },
  titleUnselected: {
    color: Palette.deepTeal,
  },
  titleSelected: {
    color: Palette.pureWhite,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  subtitleUnselected: {
    color: Palette.textSecondary,
  },
  subtitleSelected: {
    color: "rgba(255, 248, 240, 0.8)",
  },
});
