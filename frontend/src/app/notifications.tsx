import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppFonts, Palette } from "@/constants/theme";
import { api } from "@/services/api";

export type NotificationType =
  | "like"
  | "comment"
  | "reply"
  | "follower"
  | "mentor_connection"
  | "mention"
  | "message"
  | "system";

export interface NotificationItem {
  id: string;
  actorId?: string;
  actorName: string;
  actorAvatar?: string;
  type: NotificationType;
  actionText: string;
  targetPreview?: string;
  timestamp: string;
  section: "Today" | "Yesterday" | "Earlier";
  isRead: boolean;
  route?: string;
}

const STORAGE_NOTIF_KEY = "@honour-your-mentor/notifications_v2";

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    actorName: "Alex Turner",
    actorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    type: "like",
    actionText: "liked your memory.",
    targetPreview: "“Guidance through my first clinical presentation”",
    timestamp: "10m ago",
    section: "Today",
    isRead: false,
    route: "/memory-wall",
  },
  {
    id: "notif-2",
    actorName: "Sarah Jenkins",
    actorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    type: "comment",
    actionText: "commented on your appreciation.",
    targetPreview: "“Mrs. Anita Sharma had that exact warmth with all of us.”",
    timestamp: "2h ago",
    section: "Today",
    isRead: false,
    route: "/memory-wall",
  },
  {
    id: "notif-3",
    actorName: "Emma Watson",
    actorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    type: "follower",
    actionText: "started following you.",
    timestamp: "4h ago",
    section: "Today",
    isRead: false,
    route: "/profile",
  },
  {
    id: "notif-4",
    actorName: "Sarah Jenkins",
    actorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    type: "mention",
    actionText: "mentioned you in a memory.",
    targetPreview: "“Grateful to collaborate with @you on Mrs. Sharma's tribute.”",
    timestamp: "6h ago",
    section: "Today",
    isRead: false,
    route: "/memory-wall",
  },
  {
    id: "notif-5",
    actorName: "David Mitchell",
    actorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    type: "reply",
    actionText: "replied to your comment.",
    targetPreview: "“Indeed, quiet lessons stay with us the longest.”",
    timestamp: "Yesterday 3:45 PM",
    section: "Yesterday",
    isRead: false,
    route: "/memory-wall",
  },
  {
    id: "notif-6",
    actorName: "John Keating",
    actorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    type: "mentor_connection",
    actionText: "accepted your mentor connection.",
    timestamp: "Yesterday 11:20 AM",
    section: "Yesterday",
    isRead: true,
    route: "/mentor-profile/m1",
  },
  {
    id: "notif-7",
    actorName: "Elena Rostova",
    actorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    type: "like",
    actionText: "liked your keepsake letter.",
    targetPreview: "“Words that stayed in my pocket”",
    timestamp: "3 days ago",
    section: "Earlier",
    isRead: true,
    route: "/saved-items",
  },
  {
    id: "notif-8",
    actorName: "Honour Your Mentor",
    actorAvatar:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
    type: "system",
    actionText: "Welcome! Start by recording a voice memo or tribute for a mentor.",
    timestamp: "5 days ago",
    section: "Earlier",
    isRead: true,
    route: "/create",
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "mentions">("all");
  const [refreshing, setRefreshing] = useState(false);

  // Load persisted notifications or sync with backend
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_NOTIF_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }

      // Sync from backend if online
      const res = await api.notifications.list().catch(() => null);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: NotificationItem[] = res.data.map((b: any) => ({
          id: b.id,
          actorName: b.actorName || "A Member",
          actorAvatar: b.actorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          type: (b.type?.toLowerCase() || "like") as NotificationType,
          actionText: b.message || b.title,
          targetPreview: b.targetPreview,
          timestamp: "Recently",
          section: "Today",
          isRead: b.isRead ?? false,
          route: b.targetType === "MENTOR" ? "/mentor-profile/m1" : "/memory-wall",
        }));
        setNotifications(mapped);
        await AsyncStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(mapped));
      }
    } catch {
      // non-fatal
    }
  };

  const persistNotifications = async (updated: NotificationItem[]) => {
    setNotifications(updated);
    try {
      await AsyncStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(updated));
    } catch {
      // non-fatal
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    await persistNotifications(updated);
    api.notifications.markAllRead().catch(() => {});
  };

  // Tap notification: mark single as read & navigate
  const handleOpenNotification = async (item: NotificationItem) => {
    if (!item.isRead) {
      const updated = notifications.map((n) =>
        n.id === item.id ? { ...n, isRead: true } : n
      );
      await persistNotifications(updated);
      api.notifications.markRead(item.id).catch(() => {});
    }

    if (item.route) {
      router.push(item.route as any);
    }
  };

  // Delete / clear individual notification with confirmation
  const handleDeleteNotification = (item: NotificationItem) => {
    Alert.alert(
      "Delete Notification",
      `Are you sure you want to remove this notification?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = notifications.filter((n) => n.id !== item.id);
            await persistNotifications(updated);
            api.notifications.delete(item.id).catch(() => {});
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Filter logic
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.isRead;
    if (activeTab === "mentions") return item.type === "mention";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const mentionsCount = notifications.filter((n) => n.type === "mention").length;

  // Group by sections: Today, Yesterday, Earlier
  const sections = [
    { title: "Today" as const, data: filteredNotifications.filter((n) => n.section === "Today") },
    { title: "Yesterday" as const, data: filteredNotifications.filter((n) => n.section === "Yesterday") },
    { title: "Earlier" as const, data: filteredNotifications.filter((n) => n.section === "Earlier") },
  ].filter((s) => s.data.length > 0);

  // Activity Icon & Color helper
  const getActivityIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
        return { name: "heart" as const, color: "#FF4D6D", bg: "rgba(255, 77, 109, 0.16)" };
      case "comment":
        return { name: "chatbubble-ellipses" as const, color: Palette.accentSky, bg: "rgba(91, 192, 222, 0.16)" };
      case "reply":
        return { name: "return-down-forward" as const, color: Palette.accentLavender, bg: "rgba(186, 161, 237, 0.16)" };
      case "follower":
        return { name: "person-add" as const, color: Palette.accentMint, bg: "rgba(92, 209, 158, 0.16)" };
      case "mentor_connection":
        return { name: "people" as const, color: Palette.accentGold, bg: "rgba(235, 187, 86, 0.16)" };
      case "mention":
        return { name: "at" as const, color: Palette.oceanTeal, bg: "rgba(0, 168, 150, 0.16)" };
      case "message":
        return { name: "mail" as const, color: "#FFA726", bg: "rgba(255, 167, 38, 0.16)" };
      default:
        return { name: "sparkles" as const, color: Palette.cream, bg: "rgba(245, 238, 220, 0.16)" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={styles.markAllBtn}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <Ionicons name="checkmark-done" size={17} color={Palette.oceanTeal} />
            <Text style={styles.markAllText}>Mark Read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Filters: All, Unread, Mentions */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, activeTab === "all" && styles.filterChipActive]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.filterChipText, activeTab === "all" && styles.filterChipTextActive]}>
            All
          </Text>
          <View style={[styles.badge, activeTab === "all" && styles.badgeActive]}>
            <Text style={[styles.badgeText, activeTab === "all" && styles.badgeTextActive]}>
              {notifications.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeTab === "unread" && styles.filterChipActive]}
          onPress={() => setActiveTab("unread")}
        >
          <Text style={[styles.filterChipText, activeTab === "unread" && styles.filterChipTextActive]}>
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, styles.unreadCountBadge]}>
              <Text style={styles.unreadCountBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeTab === "mentions" && styles.filterChipActive]}
          onPress={() => setActiveTab("mentions")}
        >
          <Ionicons
            name="at"
            size={14}
            color={activeTab === "mentions" ? "#000000" : Palette.textMuted}
          />
          <Text style={[styles.filterChipText, activeTab === "mentions" && styles.filterChipTextActive]}>
            Mentions
          </Text>
          {mentionsCount > 0 && (
            <View style={[styles.badge, activeTab === "mentions" && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === "mentions" && styles.badgeTextActive]}>
                {mentionsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Notifications List grouped by Section */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Palette.oceanTeal} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={36} color={Palette.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              When mentors, peers, or friends like your keepsakes, leave comments, or mention you, they will appear here.
            </Text>
          </View>
        }
        renderItem={({ item: section }) => (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.data.map((notif) => {
              const iconCfg = getActivityIcon(notif.type);
              return (
                <Pressable
                  key={notif.id}
                  style={({ pressed }) => [
                    styles.notifCard,
                    !notif.isRead && styles.notifCardUnread,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => handleOpenNotification(notif)}
                >
                  {/* Left: Avatar with badge icon overlay */}
                  <View style={styles.avatarWrap}>
                    <Image
                      source={{
                        uri:
                          notif.actorAvatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                      }}
                      style={styles.actorAvatar}
                    />
                    <View style={[styles.typeIconBadge, { backgroundColor: iconCfg.bg }]}>
                      <Ionicons name={iconCfg.name} size={11} color={iconCfg.color} />
                    </View>
                  </View>

                  {/* Center: Details */}
                  <View style={styles.detailCol}>
                    <Text style={styles.messageText}>
                      <Text style={styles.actorNameText}>{notif.actorName} </Text>
                      {notif.actionText}
                    </Text>

                    {notif.targetPreview && (
                      <Text style={styles.targetPreviewText} numberOfLines={1}>
                        {notif.targetPreview}
                      </Text>
                    )}

                    <Text style={styles.timeText}>{notif.timestamp}</Text>
                  </View>

                  {/* Right: Unread Indicator & Delete */}
                  <View style={styles.rightActionCol}>
                    {!notif.isRead && <View style={styles.unreadIndicatorDot} />}

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteNotification(notif)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel="Delete notification"
                    >
                      <Ionicons name="trash-outline" size={14} color="rgba(255, 255, 255, 0.3)" />
                    </TouchableOpacity>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0A",
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
    borderRadius: 20,
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
    letterSpacing: -0.3,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0, 168, 150, 0.12)",
  },
  markAllText: {
    color: Palette.oceanTeal,
    fontSize: 12.5,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  filterChipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  filterChipText: {
    color: Palette.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  filterChipTextActive: {
    color: "#000000",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  badgeActive: {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  badgeText: {
    color: Palette.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextActive: {
    color: "#000000",
  },
  unreadCountBadge: {
    backgroundColor: "#FF4D6D",
  },
  unreadCountBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Palette.textMuted,
    fontFamily: AppFonts.body,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#141414",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: "#1C1C1C",
    borderColor: "rgba(0, 168, 150, 0.3)",
  },
  avatarWrap: {
    position: "relative",
  },
  actorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#222222",
  },
  typeIconBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#141414",
  },
  detailCol: {
    flex: 1,
    gap: 3,
  },
  messageText: {
    color: Palette.cream,
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: AppFonts.body,
  },
  actorNameText: {
    fontWeight: "800",
    color: "#FFFFFF",
  },
  targetPreviewText: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 1,
    fontFamily: AppFonts.body,
  },
  timeText: {
    color: Palette.textMuted,
    fontSize: 11.5,
    marginTop: 3,
  },
  rightActionCol: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingTop: 2,
  },
  unreadIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.oceanTeal,
  },
  deleteButton: {
    padding: 4,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#161616",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: AppFonts.body,
  },
});
