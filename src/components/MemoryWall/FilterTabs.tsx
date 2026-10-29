import React from "react";
import {
  Animated,
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

interface FilterChipProps {
  tab: WallFilterTab;
  isActive: boolean;
  onSelect: (key: WallCategory) => void;
}

function FilterChip({ tab, isActive, onSelect }: FilterChipProps) {
  const scale = React.useMemo(() => new Animated.Value(1), []);

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.04 : 1,
      speed: 24,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  }, [isActive, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
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
    </Animated.View>
  );
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
            <FilterChip
              key={tab.key}
              tab={tab}
              isActive={isActive}
              onSelect={onSelect}
            />
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
    minHeight: 52,
    minWidth: 82,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
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
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  chipTextActive: {
    color: Palette.textOnPrimary,
  },
});
