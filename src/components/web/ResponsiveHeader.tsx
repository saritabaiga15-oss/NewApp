import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { useQrModal } from "@/context/QrModalContext";
import { Palette } from "@/constants/theme";

interface ResponsiveHeaderProps {
  onOpenQrModal?: () => void;
}

export default function ResponsiveHeader({ onOpenQrModal }: ResponsiveHeaderProps) {
  const { isDesktop, isTablet, isWeb } = useResponsive();
  const { openQrModal } = useQrModal();
  const pathname = usePathname();

  // Only show desktop top bar on Web when screen is tablet or desktop
  if (!isWeb || (!isDesktop && !isTablet)) {
    return null;
  }

  const handleOpenQr = () => {
    if (onOpenQrModal) onOpenQrModal();
    else openQrModal("https://onodem.com");
  };

  const navLinks = [
    { label: "Home", path: "/home", icon: "home-outline" as const },
    { label: "Memory Wall", path: "/memory-wall", icon: "images-outline" as const },
    { label: "Discover", path: "/discover", icon: "compass-outline" as const },
    { label: "Create", path: "/create", icon: "add-circle-outline" as const },
  ];

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.container}>
        {/* Left: Brand Identity */}
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => router.push("/home")}
          activeOpacity={0.8}
        >
          <Image
            source={require("../../../assets/images/logo_transparent.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandName}>Honour Your Mentor</Text>
            <Text style={styles.brandTagline}>Remembering those who shaped us</Text>
          </View>
        </TouchableOpacity>

        {/* Center: Navigation Links */}
        <View style={styles.navLinks}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path === "/home" && pathname === "/");
            return (
              <TouchableOpacity
                key={link.path}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(link.path as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={link.icon}
                  size={16}
                  color={isActive ? Palette.oceanTeal : Palette.textSecondary}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right: Actions (QR Code Modal + Profile) */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleOpenQr}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={16} color={Palette.oceanTeal} />
            <Text style={styles.qrButtonText}>Open on Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={26} color={Palette.oceanTeal} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 100,
  },
  container: {
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: Palette.mintMist,
  },
  navText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  navTextActive: {
    color: Palette.oceanTeal,
    fontWeight: "700",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CFE3DC",
  },
  qrButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  profileBtn: {
    padding: 2,
  },
});
