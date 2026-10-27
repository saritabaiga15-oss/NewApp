import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MaxContentWidth, Palette } from "@/constants/theme";
import { deleteAccount, signOut } from "@/services/auth";

type SettingsIcon = keyof typeof Ionicons.glyphMap;

export default function SettingsScreen() {
  const confirmSignOut = () => {
    Alert.alert(
      "Sign out",
      "This app build does not have a connected sign-in session. You can still return to the sign-in screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/login");
            } catch (error) {
              console.error("Unable to sign out:", error);
              Alert.alert(
                "Sign out unavailable",
                error instanceof Error ? error.message : "No sign-out service is available."
              );
            }
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Account deletion permanently removes account data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm account deletion",
              "Do you explicitly confirm that you want to delete this account?",
              [
                { text: "Keep account", style: "cancel" },
                {
                  text: "Delete account",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                    } catch (error) {
                      console.error("Unable to delete account:", error);
                      Alert.alert(
                        "Account not deleted",
                        error instanceof Error
                          ? error.message
                          : "No account-deletion service is available."
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={23} color={Palette.deepTeal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Keep your account comfortable, private and yours.
        </Text>

        <Text style={styles.groupTitle}>YOUR ACCOUNT</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="person-circle-outline"
            title="Personal information"
            subtitle="Update your name, username, photograph and bio"
            onPress={() => router.push("/profile-edit")}
          />
          <SettingsRow
            icon="key-outline"
            title="Email & account security"
            subtitle="Reset your password"
            onPress={() => router.push("/forgot-password")}
            last
          />
        </View>

        <Text style={styles.groupTitle}>PREFERENCES & PRIVACY</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="notifications-outline"
            title="Notifications & preferences"
            subtitle="Push notification preferences are not configured"
            onPress={() =>
              Alert.alert(
                "Notifications",
                "This app does not currently request notification permissions or send push notifications."
              )
            }
          />
          <SettingsRow
            icon="lock-closed-outline"
            title="Privacy & story visibility"
            subtitle="Your stories and profile are stored locally on this device"
            onPress={() =>
              Alert.alert(
                "Your privacy",
                "This build has no account backend or public sharing service. Your profile and keepsakes remain in local app storage."
              )
            }
            last
          />
        </View>

        <Text style={styles.groupTitle}>ABOUT & SUPPORT</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="help-circle-outline"
            title="Help & support"
            subtitle="Learn about this app build"
            onPress={() =>
              Alert.alert(
                "Help & support",
                "For now, profile information and keepsakes are stored on this device. A support contact has not been configured in this build."
              )
            }
          />
          <SettingsRow
            icon="information-circle-outline"
            title="About Honour Your Mentor"
            subtitle="A personal archive of gratitude"
            onPress={() =>
              Alert.alert(
                "Honour Your Mentor",
                "A place to preserve the stories, memories and lessons from people who helped you grow."
              )
            }
            last
          />
        </View>

        <View style={styles.dangerGroup}>
          <SettingsRow
            icon="log-out-outline"
            title="Log out"
            subtitle="End your current session"
            onPress={confirmSignOut}
            danger
          />
          <SettingsRow
            icon="trash-outline"
            title="Delete account"
            subtitle="Permanently remove your account"
            onPress={confirmDeleteAccount}
            danger
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  last = false,
}: {
  icon: SettingsIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, last && styles.lastRow]}
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={[styles.rowIcon, danger && styles.dangerIcon]}>
        <Ionicons
          name={icon}
          size={19}
          color={danger ? "#9E2A2B" : Palette.oceanTeal}
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.iceWhite },
  header: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { width: 42, height: 42, justifyContent: "center" },
  headerTitle: {
    color: Palette.deepTeal,
    fontSize: 22,
    fontWeight: "800",
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 36,
  },
  intro: {
    marginBottom: 25,
    color: Palette.textSecondary,
    fontSize: 15,
  },
  groupTitle: {
    marginBottom: 9,
    color: Palette.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  group: {
    paddingHorizontal: 13,
    marginBottom: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  row: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  lastRow: { borderBottomWidth: 0 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.mintMist,
  },
  dangerIcon: { backgroundColor: "#FCE8E5" },
  rowCopy: { flex: 1 },
  rowTitle: { color: Palette.deepTeal, fontSize: 13, fontWeight: "800" },
  rowSubtitle: { marginTop: 3, color: Palette.textSecondary, fontSize: 10 },
  dangerText: { color: "#9E2A2B" },
  dangerGroup: {
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(158, 42, 43, 0.18)",
    backgroundColor: Palette.pureWhite,
  },
});
