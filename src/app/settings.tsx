import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppFonts, Palette } from "@/constants/theme";
import { deleteAccount, signOut } from "@/services/auth";
import { api } from "@/services/api";

type SettingsIcon = keyof typeof Ionicons.glyphMap;

const SETTINGS_STORAGE_KEY = "@honour-your-mentor/settings_v2";

export default function SettingsScreen() {
  // Modal states for settings
  const [activeModal, setActiveModal] = useState<
    "privacy" | "notifications" | "autocorrect" | "blocked" | "help" | null
  >(null);

  // Preference switches: Writing aids
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true);
  const [grammarCheckEnabled, setGrammarCheckEnabled] = useState(true);
  const [writingSuggestionsEnabled, setWritingSuggestionsEnabled] = useState(true);

  // 1. Notification Preferences (the 6 types requested)
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollowers, setNotifFollowers] = useState(true);
  const [notifMentorConnections, setNotifMentorConnections] = useState(true);
  const [notifMentions, setNotifMentions] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);

  // 2. Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState<"PUBLIC" | "CONNECTIONS_ONLY" | "PRIVATE">("PUBLIC");
  const [defaultTributePrivacy, setDefaultTributePrivacy] = useState<"PUBLIC" | "CONNECTIONS_ONLY" | "PRIVATE">("PUBLIC");
  const [connectionsVisibility, setConnectionsVisibility] = useState<"EVERYONE" | "CONNECTIONS_ONLY" | "HIDDEN">("EVERYONE");
  const [activityStatusEnabled, setActivityStatusEnabled] = useState(true);

  const [blockedUsers, setBlockedUsers] = useState<string[]>([
    "spammer_bot_99",
    "unwanted_contact",
  ]);

  // Load saved preferences
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.notifLikes !== undefined) setNotifLikes(parsed.notifLikes);
        if (parsed.notifComments !== undefined) setNotifComments(parsed.notifComments);
        if (parsed.notifFollowers !== undefined) setNotifFollowers(parsed.notifFollowers);
        if (parsed.notifMentorConnections !== undefined) setNotifMentorConnections(parsed.notifMentorConnections);
        if (parsed.notifMentions !== undefined) setNotifMentions(parsed.notifMentions);
        if (parsed.notifMessages !== undefined) setNotifMessages(parsed.notifMessages);

        if (parsed.profileVisibility) setProfileVisibility(parsed.profileVisibility);
        if (parsed.defaultTributePrivacy) setDefaultTributePrivacy(parsed.defaultTributePrivacy);
        if (parsed.connectionsVisibility) setConnectionsVisibility(parsed.connectionsVisibility);
        if (parsed.activityStatusEnabled !== undefined) setActivityStatusEnabled(parsed.activityStatusEnabled);
      }

      // Check backend profile settings if logged in
      const res = await api.users.me().catch(() => null);
      if (res?.data) {
        const u = res.data;
        if (u.notifLikes !== undefined) setNotifLikes(u.notifLikes);
        if (u.notifComments !== undefined) setNotifComments(u.notifComments);
        if (u.notifFollowers !== undefined) setNotifFollowers(u.notifFollowers);
        if (u.notifMentorConnections !== undefined) setNotifMentorConnections(u.notifMentorConnections);
        if (u.notifMentions !== undefined) setNotifMentions(u.notifMentions);
        if (u.notifMessages !== undefined) setNotifMessages(u.notifMessages);
        if (u.profileVisibility) setProfileVisibility(u.profileVisibility);
        if (u.defaultTributePrivacy) setDefaultTributePrivacy(u.defaultTributePrivacy);
        if (u.connectionsVisibility) setConnectionsVisibility(u.connectionsVisibility);
        if (u.activityStatusEnabled !== undefined) setActivityStatusEnabled(u.activityStatusEnabled);
      }
    } catch {
      // non-fatal
    }
  };

  const saveSettings = async (overrides: Record<string, any> = {}) => {
    const payload = {
      notifLikes,
      notifComments,
      notifFollowers,
      notifMentorConnections,
      notifMentions,
      notifMessages,
      profileVisibility,
      defaultTributePrivacy,
      connectionsVisibility,
      activityStatusEnabled,
      ...overrides,
    };

    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      await api.users.updateSettings(payload).catch(() => {});
    } catch {
      // non-fatal
    }
  };

  const handleSaveNotifications = async () => {
    await saveSettings();
    setActiveModal(null);
    Alert.alert("Preferences Saved", "Your notification preferences have been updated.");
  };

  const handleSavePrivacy = async () => {
    await saveSettings();
    setActiveModal(null);
    Alert.alert("Privacy Updated", "Your privacy controls have been saved.");
  };

  const confirmSignOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Honour Your Mentor?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/login");
            } catch {
              router.replace("/login");
            }
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? All your keepsakes, tributes, and profile data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This action cannot be undone. Confirm permanent account deletion.",
              [
                { text: "Keep Account", style: "cancel" },
                {
                  text: "Permanently Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      router.replace("/login");
                    } catch {
                      router.replace("/login");
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

  const handleUnblock = (username: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u !== username));
    Alert.alert("User Unblocked", `@${username} has been unblocked.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={23} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Customize your experience, notification alerts, privacy, and account security.
        </Text>

        {/* Section 1: Account & Core Preferences */}
        <Text style={styles.groupTitle}>ACCOUNT & PREFERENCES</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="person-circle-outline"
            iconColor={Palette.accentSky}
            title="Account Information"
            subtitle="Name, username, photograph and bio"
            onPress={() => router.push("/profile-edit")}
          />
          <SettingsRow
            icon="notifications-outline"
            iconColor={Palette.accentPink}
            title="Notifications"
            subtitle="View all activity, mentions, and updates"
            onPress={() => router.push("/notifications" as any)}
          />
          <SettingsRow
            icon="options-outline"
            iconColor={Palette.oceanTeal}
            title="Notification Preferences"
            subtitle="Likes, comments, followers, connections, mentions"
            onPress={() => setActiveModal("notifications")}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            iconColor={Palette.accentMint}
            title="Privacy Settings"
            subtitle="Profile visibility, tribute sharing, connection lists"
            onPress={() => setActiveModal("privacy")}
          />
          <SettingsRow
            icon="color-wand-outline"
            iconColor={Palette.accentLavender}
            title="Auto-correction Settings"
            subtitle="Auto-correct, grammar checks, writing aids"
            onPress={() => setActiveModal("autocorrect")}
          />
          <SettingsRow
            icon="ban-outline"
            iconColor={Palette.accentCoral}
            title="Blocked Users"
            subtitle={`${blockedUsers.length} blocked profiles`}
            onPress={() => setActiveModal("blocked")}
            last
          />
        </View>

        {/* Section 2: Support & Danger Zone */}
        <Text style={styles.groupTitle}>SUPPORT & ACCOUNT ACTIONS</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="help-circle-outline"
            iconColor={Palette.accentSky}
            title="Help and Support"
            subtitle="FAQs, writing guides, and contact support"
            onPress={() => setActiveModal("help")}
          />
          <SettingsRow
            icon="log-out-outline"
            iconColor={Palette.textPrimary}
            title="Log Out"
            subtitle="Sign out from this device"
            onPress={confirmSignOut}
          />
          <SettingsRow
            icon="trash-outline"
            iconColor="#FF4D6D"
            title="Delete Account"
            subtitle="Permanently remove your account and stored tributes"
            titleColor="#FF4D6D"
            onPress={confirmDeleteAccount}
            last
          />
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* 1. Privacy Settings Modal                                */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "privacy"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Privacy Settings</Text>
            <Text style={styles.modalSubtitle}>Control who can read your tributes and view your profile</Text>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Profile Visibility Selector */}
              <View style={styles.privacyOptionGroup}>
                <Text style={styles.privacyOptionLabel}>Profile Visibility</Text>
                <View style={styles.radioGroup}>
                  {(["PUBLIC", "CONNECTIONS_ONLY", "PRIVATE"] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.radioItem, profileVisibility === mode && styles.radioItemActive]}
                      onPress={() => setProfileVisibility(mode)}
                    >
                      <Ionicons
                        name={profileVisibility === mode ? "radio-button-on" : "radio-button-off"}
                        size={17}
                        color={profileVisibility === mode ? Palette.oceanTeal : Palette.textMuted}
                      />
                      <Text style={[styles.radioItemText, profileVisibility === mode && styles.radioItemTextActive]}>
                        {mode === "PUBLIC"
                          ? "Public (Everyone)"
                          : mode === "CONNECTIONS_ONLY"
                          ? "Connections Only"
                          : "Private (Hidden)"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Default Tribute Privacy */}
              <View style={styles.privacyOptionGroup}>
                <Text style={styles.privacyOptionLabel}>Default Tribute Visibility</Text>
                <View style={styles.radioGroup}>
                  {(["PUBLIC", "CONNECTIONS_ONLY", "PRIVATE"] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.radioItem, defaultTributePrivacy === mode && styles.radioItemActive]}
                      onPress={() => setDefaultTributePrivacy(mode)}
                    >
                      <Ionicons
                        name={defaultTributePrivacy === mode ? "radio-button-on" : "radio-button-off"}
                        size={17}
                        color={defaultTributePrivacy === mode ? Palette.accentMint : Palette.textMuted}
                      />
                      <Text style={[styles.radioItemText, defaultTributePrivacy === mode && styles.radioItemTextActive]}>
                        {mode === "PUBLIC"
                          ? "Public Tribute Wall"
                          : mode === "CONNECTIONS_ONLY"
                          ? "Followers & Connections Only"
                          : "Private Keepsake (Only Mentor & You)"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Connection List Visibility */}
              <View style={styles.privacyOptionGroup}>
                <Text style={styles.privacyOptionLabel}>Followers & Mentor List Visibility</Text>
                <View style={styles.radioGroup}>
                  {(["EVERYONE", "CONNECTIONS_ONLY", "HIDDEN"] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.radioItem, connectionsVisibility === mode && styles.radioItemActive]}
                      onPress={() => setConnectionsVisibility(mode)}
                    >
                      <Ionicons
                        name={connectionsVisibility === mode ? "radio-button-on" : "radio-button-off"}
                        size={17}
                        color={connectionsVisibility === mode ? Palette.accentSky : Palette.textMuted}
                      />
                      <Text style={[styles.radioItemText, connectionsVisibility === mode && styles.radioItemTextActive]}>
                        {mode === "EVERYONE"
                          ? "Show to everyone"
                          : mode === "CONNECTIONS_ONLY"
                          ? "Connections only"
                          : "Hide from everyone"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Activity Status Toggle */}
              <View style={styles.settingItemRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingItemTitle}>Activity Status</Text>
                  <Text style={styles.settingItemSub}>Show active status to your mentor & mentee circles</Text>
                </View>
                <Switch
                  value={activityStatusEnabled}
                  onValueChange={setActivityStatusEnabled}
                  trackColor={{ false: "#333333", true: Palette.oceanTeal }}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleSavePrivacy}>
              <Text style={styles.modalPrimaryBtnText}>Save Privacy Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 2. Notification Preferences Modal                        */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "notifications"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Notification Preferences</Text>
            <Text style={styles.modalSubtitle}>Enable or disable alerts for specific interactions</Text>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* 1. Likes */}
              <View style={styles.settingItemRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingItemTitle}>Likes</Text>
                  <Text style={styles.settingItemSub}>
                    When someone likes your memory, memo, note, open letter or appreciation
                  </Text>
                </View>
                <Switch
                  value={notifLikes}
                  onValueChange={setNotifLikes}
                  trackColor={{ false: "#333333", true: "#FF4D6D" }}
                />
              </View>

              {/* 2. Comments and replies */}
              <View style={styles.settingItemRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingItemTitle}>Comments & Replies</Text>
                  <Text style={styles.settingItemSub}>
                    When someone comments on your content or replies to your comment
                  </Text>
                </View>
                <Switch
                  value={notifComments}
                  onValueChange={setNotifComments}
                  trackColor={{ false: "#333333", true: Palette.accentSky }}
                />
              </View>

              {/* 3. New Followers */}
              <View style={styles.settingItemRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingItemTitle}>New Followers</Text>
                  <Text style={styles.settingItemSub}>When someone follows your mentor or mentee profile</Text>
                </View>
                <Switch
                  value={notifFollowers}
                  onValueChange={setNotifFollowers}
                  trackColor={{ false: "#333333", true: Palette.accentMint }}
                />
              </View>

              {/* 4. Mentor Connection Requests */}
              <View style={styles.settingItemRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingItemTitle}>Mentor Connection Requests</Text>
                  <Text style={styles.settingItemSub}>
                    When someone sends, accepts, or declines a mentor connection request
                  </Text>
                </View>
                <Switch
                  value={notifMentorConnections}
                  onValueChange={setNotifMentorConnections}
                  trackColor={{ false: "#333333", true: Palette.accentGold }}
                />
              </View>

              {/* 5. Mentions and Tags */}
              <View style={styles.settingItemRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingItemTitle}>Mentions and Tags</Text>
                  <Text style={styles.settingItemSub}>When someone mentions or tags you in content</Text>
                </View>
                <Switch
                  value={notifMentions}
                  onValueChange={setNotifMentions}
                  trackColor={{ false: "#333333", true: Palette.oceanTeal }}
                />
              </View>

              {/* 6. Messages */}
              <View style={styles.settingItemRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingItemTitle}>Messages</Text>
                  <Text style={styles.settingItemSub}>When you receive direct messages or guidance notes</Text>
                </View>
                <Switch
                  value={notifMessages}
                  onValueChange={setNotifMessages}
                  trackColor={{ false: "#333333", true: "#FFA726" }}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleSaveNotifications}>
              <Text style={styles.modalPrimaryBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 3. Auto-correction Settings Modal                        */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "autocorrect"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Auto-correction Settings</Text>
            <Text style={styles.modalSubtitle}>AI Writing Assistant and Grammar Tools</Text>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Auto-correct: {autoCorrectEnabled ? "ON" : "OFF"}</Text>
                <Text style={styles.settingItemSub}>Automatically fix common spelling typos</Text>
              </View>
              <Switch
                value={autoCorrectEnabled}
                onValueChange={setAutoCorrectEnabled}
                trackColor={{ false: "#333333", true: Palette.accentMint }}
              />
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Grammar Check</Text>
                <Text style={styles.settingItemSub}>Detect capitalization, punctuation, and phrasing</Text>
              </View>
              <Switch
                value={grammarCheckEnabled}
                onValueChange={setGrammarCheckEnabled}
                trackColor={{ false: "#333333", true: Palette.accentSky }}
              />
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Improve My Writing</Text>
                <Text style={styles.settingItemSub}>Elevate gratitude reflections with heartfelt tone suggestions</Text>
              </View>
              <Switch
                value={writingSuggestionsEnabled}
                onValueChange={setWritingSuggestionsEnabled}
                trackColor={{ false: "#333333", true: Palette.accentLavender }}
              />
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 4. Blocked Users Modal                                   */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "blocked"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Blocked Users</Text>
            <Text style={styles.modalSubtitle}>Accounts you’ve prevented from interacting with your profile</Text>

            {blockedUsers.length === 0 ? (
              <View style={styles.emptyBlocked}>
                <Ionicons name="shield-checkmark-outline" size={40} color={Palette.accentMint} />
                <Text style={styles.emptyBlockedTitle}>No blocked users</Text>
                <Text style={styles.emptyBlockedSub}>You haven't blocked anyone yet.</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 280 }}>
                {blockedUsers.map((u) => (
                  <View key={u} style={styles.blockedRow}>
                    <View style={styles.blockedUserMeta}>
                      <Ionicons name="person-circle-outline" size={24} color={Palette.textMuted} />
                      <Text style={styles.blockedUsername}>@{u}</Text>
                    </View>
                    <TouchableOpacity style={styles.unblockBtn} onPress={() => handleUnblock(u)}>
                      <Text style={styles.unblockBtnText}>Unblock</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 5. Help & Support Modal                                  */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "help"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Help & Support</Text>
            <Text style={styles.modalSubtitle}>How can we assist your gratitude journey?</Text>

            <View style={styles.helpList}>
              <View style={styles.helpCard}>
                <Ionicons name="book-outline" size={20} color={Palette.accentSky} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpCardTitle}>Writing Guide</Text>
                  <Text style={styles.helpCardText}>Learn tips on framing heartfelt tributes and memories.</Text>
                </View>
              </View>

              <View style={styles.helpCard}>
                <Ionicons name="shield-outline" size={20} color={Palette.accentMint} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpCardTitle}>Keepsake Safety</Text>
                  <Text style={styles.helpCardText}>Your tributes are encrypted and stored safely on this device.</Text>
                </View>
              </View>

              <View style={styles.helpCard}>
                <Ionicons name="mail-outline" size={20} color={Palette.accentPink} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpCardTitle}>Contact Team</Text>
                  <Text style={styles.helpCardText}>info@onodem.com</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  iconColor = "#FFFFFF",
  title,
  subtitle,
  titleColor = "#FFFFFF",
  onPress,
  last = false,
}: {
  icon: SettingsIcon;
  iconColor?: string;
  title: string;
  subtitle: string;
  titleColor?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: titleColor }]}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={Palette.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 13.5,
    color: Palette.textSecondary,
    marginBottom: 20,
    lineHeight: 19,
    fontFamily: AppFonts.body,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Palette.textMuted,
    marginBottom: 10,
    fontFamily: AppFonts.body,
  },
  group: {
    backgroundColor: "#161616",
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  modalSheet: {
    backgroundColor: "#181818",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    borderTopWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 14,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginBottom: 6,
    fontFamily: AppFonts.body,
  },
  privacyOptionGroup: {
    marginBottom: 16,
    gap: 8,
  },
  privacyOptionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  radioGroup: {
    gap: 6,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  radioItemActive: {
    backgroundColor: "rgba(0, 168, 150, 0.1)",
    borderColor: "rgba(0, 168, 150, 0.35)",
  },
  radioItemText: {
    fontSize: 13,
    color: Palette.textSecondary,
    fontFamily: AppFonts.body,
  },
  radioItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  settingTextCol: {
    flex: 1,
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  settingItemSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  modalPrimaryBtn: {
    backgroundColor: Palette.accentMint,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  modalPrimaryBtnText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#111111",
    fontFamily: AppFonts.body,
  },
  emptyBlocked: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  emptyBlockedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyBlockedSub: {
    fontSize: 12.5,
    color: Palette.textSecondary,
  },
  blockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  blockedUserMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  blockedUsername: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  unblockBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.accentSky,
  },
  helpList: {
    gap: 10,
    marginVertical: 4,
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 12,
    borderRadius: 14,
  },
  helpCardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  helpCardText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});
