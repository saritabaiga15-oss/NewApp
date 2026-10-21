import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { WallCategory, WallFilterTab } from "@/types/memoryWall";

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
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} filter`}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
                size={14}
                color={isActive ? "#FFF8F0" : Palette.textSecondary}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {isActive && (
                <View style={styles.countBubble}>
                  <Text style={styles.countText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Palette.iceWhite,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    gap: 5,
  },
  tabActive: {
    backgroundColor: Palette.deepTeal,
    borderColor: Palette.deepTeal,
    shadowColor: Palette.deepTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabIcon: {
    marginRight: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  tabTextActive: {
    color: "#FFF8F0",
  },
  countBubble: {
    backgroundColor: Palette.turquoise,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  countText: {
    color: "#FFF8F0",
    fontSize: 10,
    fontWeight: "800",
  },
});
