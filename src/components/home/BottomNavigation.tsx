import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Palette } from "@/constants/theme";

export type NavTab =
  | "home"
  | "discover"
  | "create"
  | "saved"
  | "profile"
  | "wall"
  | "mentors"
  | "gratitude";

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onCreatePress?: () => void;
}

interface TabItem {
  key: NavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const FIVE_TABS: TabItem[] = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { key: "discover", label: "Discover", icon: "compass-outline", activeIcon: "compass" },
  { key: "create", label: "Create", icon: "add-circle-outline", activeIcon: "add-circle" },
  { key: "saved", label: "Saved", icon: "bookmark-outline", activeIcon: "bookmark" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onCreatePress,
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  const handleTabPress = (tabKey: NavTab) => {
    if (onTabChange) {
      onTabChange(tabKey);
    }

    if (tabKey === "create") {
      if (onCreatePress) {
        onCreatePress();
        return;
      }
      if (activeTab !== "create") {
        router.push("/create");
      }
      return;
    }

    if (tabKey === "home" && activeTab !== "home") {
      router.push("/home");
    } else if (tabKey === "discover" && activeTab !== "discover") {
      router.push("/discover");
    } else if (tabKey === "saved" && activeTab !== "saved") {
      router.push("/memory-wall");
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.container}>
        {FIVE_TABS.map((tab) => {
          const isActive =
            activeTab === tab.key ||
            (activeTab === "wall" && tab.key === "home") ||
            (activeTab === "mentors" && tab.key === "discover") ||
            (activeTab === "gratitude" && tab.key === "saved");

          const isCreate = tab.key === "create";

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.75}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.tabButton, isCreate && styles.createTabButton]}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              {isActive && !isCreate && <View style={styles.activePillIndicator} />}
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={isCreate ? 26 : 21}
                color={
                  isActive
                    ? Palette.turquoise
                    : "rgba(252, 238, 228, 0.65)"
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "transparent",
    zIndex: 99,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.deepTeal, // Deep Teal background
    shadowColor: Palette.deepTeal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(252, 238, 228, 0.15)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    position: "relative",
  },
  createTabButton: {
    transform: [{ scale: 1.05 }],
  },
  activePillIndicator: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Palette.turquoise, // Turquoise indicator
    shadowColor: Palette.turquoise,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(252, 238, 228, 0.65)",
    marginTop: 3,
  },
  tabLabelActive: {
    color: Palette.turquoise,
    fontWeight: "800",
  },
});
