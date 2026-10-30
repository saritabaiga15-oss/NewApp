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

  const isAuthRoute =
    pathname === "/onboarding" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/";

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
          onPress={() => router.push(isAuthRoute ? "/onboarding" : "/home")}
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

        {/* Center: Navigation Links (Only for authenticated internal routes) */}
        {!isAuthRoute && (
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
                    color={isActive ? "#FFFFFF" : Palette.textSecondary}
                  />
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Right: Actions */}
        <View style={styles.rightActions}>
          {isAuthRoute ? (
            // Landing / Auth quick actions
            <View style={styles.authActionsRow}>
              {pathname !== "/login" && (
                <TouchableOpacity
                  style={styles.authGhostBtn}
                  onPress={() => router.push("/login")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.authGhostText}>Log In</Text>
                </TouchableOpacity>
              )}

              {pathname !== "/register" && (
                <TouchableOpacity
                  style={styles.authPrimaryBtn}
                  onPress={() => router.push("/register")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.authPrimaryText}>Get Started</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.qrButton}
                onPress={handleOpenQr}
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code-outline" size={15} color="#FFFFFF" />
                <Text style={styles.qrButtonText}>Open on Phone</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Internal app actions
            <>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={handleOpenQr}
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code-outline" size={15} color="#FFFFFF" />
                <Text style={styles.qrButtonText}>Open on Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push("/profile")}
                activeOpacity={0.8}
              >
                <Ionicons name="person-circle-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: "100%",
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
    zIndex: 100,
  },
  container: {
    maxWidth: 1240,
    marginHorizontal: "auto",
    width: "100%",
    height: 64,
    paddingHorizontal: 24,
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
    width: 34,
    height: 34,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 11,
    color: "#8C7570",
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#2D2D2D",
  },
  navText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  navTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authGhostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  authGhostText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  authPrimaryBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
  },
  authPrimaryText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "700",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#171717",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2D2D2D",
  },
  qrButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileBtn: {
    padding: 2,
  },
});
