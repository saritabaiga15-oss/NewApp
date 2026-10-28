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
  activeColor: string;
}

const FIVE_TABS: TabItem[] = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home", activeColor: "#FFFFFF" },
  { key: "discover", label: "Discover", icon: "compass-outline", activeIcon: "compass", activeColor: "#FFFFFF" },
  { key: "create", label: "Create", icon: "add", activeIcon: "add", activeColor: "#FFFFFF" },
  { key: "saved", label: "Saved", icon: "bookmark-outline", activeIcon: "bookmark", activeColor: "#FFFFFF" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person", activeColor: "#FFFFFF" },
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
      router.push("/saved-items");
    } else if (tabKey === "profile" && activeTab !== "profile") {
      router.push("/profile");
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
          const iconColor = isActive || isCreate ? tab.activeColor : Palette.textSecondary;

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
              {isActive && !isCreate && (
                <View style={[styles.activePillIndicator, { backgroundColor: tab.activeColor }]} />
              )}
              {isCreate ? (
                <View style={styles.createButtonCircle}>
                  <Ionicons name="add" size={25} color={Palette.textOnPrimary} />
                </View>
              ) : (
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={21}
                  color={iconColor}
                />
              )}
              <Text
                style={[
                  styles.tabLabel,
                  isActive && { color: tab.activeColor, fontWeight: "800" },
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
    paddingTop: 6,
    backgroundColor: "#000000",
    zIndex: 99,
    borderTopWidth: 1,
    borderTopColor: "#303030",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 58,
    backgroundColor: "#000000",
    paddingHorizontal: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    position: "relative",
  },
  createTabButton: {
    transform: [{ translateY: -5 }],
  },
  createButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  activePillIndicator: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Palette.textSecondary,
    marginTop: 3,
  },
});
