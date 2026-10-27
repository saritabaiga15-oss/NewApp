import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WallCategory, WallFilterTab } from "@/types/memoryWall";
import { Palette } from "@/constants/theme";

interface FilterTabsProps {
  tabs: WallFilterTab[];
  active: WallCategory;
  onSelect: (key: WallCategory) => void;
}

export default function FilterTabs({ tabs, active, onSelect }: FilterTabsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelect(tab.key)}
              activeOpacity={0.75}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} filter`}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: Palette.oceanTeal,
    borderColor: Palette.oceanTeal,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  chipTextActive: {
    color: Palette.textOnPrimary,
  },
});
