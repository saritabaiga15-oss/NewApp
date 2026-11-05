import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

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
  { key: "home",     label: "Home",     icon: "home-outline",     activeIcon: "home"     },
  { key: "discover", label: "Discover", icon: "compass-outline",  activeIcon: "compass"  },
  { key: "create",   label: "Create",   icon: "add",              activeIcon: "add"      },
  { key: "saved",    label: "Saved",    icon: "bookmark-outline", activeIcon: "bookmark" },
  { key: "profile",  label: "Profile",  icon: "person-outline",   activeIcon: "person"   },
];

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onCreatePress,
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  const handleTabPress = (tabKey: NavTab) => {
    if (onTabChange) onTabChange(tabKey);

    if (tabKey === "create") {
      if (onCreatePress) { onCreatePress(); return; }
      if (activeTab !== "create") router.push("/create");
      return;
    }

    if (tabKey === "home"     && activeTab !== "home")     router.push("/home");
    else if (tabKey === "discover" && activeTab !== "discover") router.push("/discover");
    else if (tabKey === "saved"    && activeTab !== "saved")    router.push("/saved-items");
    else if (tabKey === "profile"  && activeTab !== "profile")  router.push("/profile");
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Thin top divider */}
      <View style={styles.topBorder} />

      <View style={styles.container}>
        {FIVE_TABS.map((tab) => {
          const isActive =
            activeTab === tab.key ||
            (activeTab === "wall"      && tab.key === "home")     ||
            (activeTab === "mentors"   && tab.key === "discover") ||
            (activeTab === "gratitude" && tab.key === "saved");

          const isCreate = tab.key === "create";

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.tabButton, isCreate && styles.createTabOuter]}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              {isCreate ? (
                /* Raised circle Create button */
                <View style={styles.createCircle}>
                  <Ionicons name="add" size={28} color="#111111" />
                </View>
              ) : (
                <>
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={22}
                    color={isActive ? "#111111" : "#9A9A9A"}
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
                </>
              )}
              {/* Show label below Create too */}
              {isCreate && (
                <Text style={styles.tabLabel} numberOfLines={1}>
                  {tab.label}
                </Text>
              )}
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
    backgroundColor: "#FFFFFF",
    zIndex: 99,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
  },
  topBorder: {
    height: 1,
    backgroundColor: "#EBEBEB",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 60,
    paddingHorizontal: 4,
    paddingBottom: 4,
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
    gap: 3,
  },
  /* Create button lifts above the bar */
  createTabOuter: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
    gap: 3,
    transform: [{ translateY: -6 }],
  },
  createCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9A9A9A",
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: "#111111",
    fontWeight: "700",
  },
});
