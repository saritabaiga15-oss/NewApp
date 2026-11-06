import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppFonts, Palette } from "@/constants/theme";

export interface AppNotification {
  id: string;
  actorName?: string;
  title: string;
  message: string;
  timeAgo: string;
  section: "Today" | "Yesterday" | "Earlier";
  isRead: boolean;
  type: "like" | "comment" | "reply" | "follower" | "mentor_connection" | "mention" | "system";
  route?: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    actorName: "Alex Turner",
    title: "New Like",
    message: "Alex liked your memory.",
    timeAgo: "10m ago",
    section: "Today",
    isRead: false,
    type: "like",
    route: "/memory-wall",
  },
  {
    id: "notif-2",
    actorName: "Sarah Jenkins",
    title: "New Comment",
    message: "Sarah commented on your appreciation.",
    timeAgo: "2h ago",
    section: "Today",
    isRead: false,
    type: "comment",
    route: "/memory-wall",
  },
  {
    id: "notif-3",
    actorName: "Emma Watson",
    title: "New Follower",
    message: "Emma started following you.",
    timeAgo: "4h ago",
    section: "Today",
    isRead: false,
    type: "follower",
    route: "/profile",
  },
  {
    id: "notif-4",
    actorName: "Sarah Jenkins",
    title: "Mentioned You",
    message: "Sarah mentioned you in a memory.",
    timeAgo: "6h ago",
    section: "Today",
    isRead: false,
    type: "mention",
    route: "/memory-wall",
  },
  {
    id: "notif-5",
    actorName: "David Mitchell",
    title: "New Reply",
    message: "David replied to your comment.",
    timeAgo: "Yesterday 3:45 PM",
    section: "Yesterday",
    isRead: false,
    type: "reply",
    route: "/memory-wall",
  },
  {
    id: "notif-6",
    actorName: "John Keating",
    title: "Mentor Connection",
    message: "John accepted your mentor connection.",
    timeAgo: "Yesterday 11:20 AM",
    section: "Yesterday",
    isRead: true,
    type: "mentor_connection",
    route: "/mentor-profile/m1",
  },
  {
    id: "notif-7",
    actorName: "Honour Your Mentor",
    title: "Welcome",
    message: "Express quiet gratitude and create lasting keepsakes for those who shaped your path.",
    timeAgo: "3 days ago",
    section: "Earlier",
    isRead: true,
    type: "system",
    route: "/create",
  },
];

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  onUnreadCountChange,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "mentions">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const mentionsCount = notifications.filter((n) => n.type === "mention").length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const newUnread = updated.filter((n) => !n.isRead).length;
      onUnreadCountChange?.(newUnread);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      onUnreadCountChange?.(0);
      return updated;
    });
  };

  const handleDeleteNotification = (notif: AppNotification) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setNotifications((prev) => {
              const updated = prev.filter((n) => n.id !== notif.id);
              const newUnread = updated.filter((n) => !n.isRead).length;
              onUnreadCountChange?.(newUnread);
              return updated;
            });
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notif: AppNotification) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.route) {
      onClose();
      router.push(notif.route as any);
    }
  };

  const displayedNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "mentions") return n.type === "mention";
    return true;
  });

  const getIconForType = (type: AppNotification["type"]) => {
    switch (type) {
      case "like":
        return { name: "heart" as const, color: "#FF4D6D" };
      case "comment":
        return { name: "chatbubble-ellipses" as const, color: Palette.accentSky };
      case "reply":
        return { name: "return-down-forward" as const, color: Palette.accentLavender };
      case "follower":
        return { name: "person-add" as const, color: Palette.accentMint };
      case "mentor_connection":
        return { name: "people" as const, color: Palette.accentGold };
      case "mention":
        return { name: "at" as const, color: Palette.oceanTeal };
      default:
        return { name: "sparkles-outline" as const, color: Palette.cream };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount} new</Text>
                  </View>
                )}
              </View>

              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllAsRead}
                    style={styles.markAllBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-done" size={16} color={Palette.oceanTeal} />
                    <Text style={styles.markAllText}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
              <TouchableOpacity
                onPress={() => setFilter("all")}
                style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === "all" && styles.filterTabTextActive,
                  ]}
                >
                  All ({notifications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter("unread")}
                style={[styles.filterTab, filter === "unread" && styles.filterTabActive]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === "unread" && styles.filterTabTextActive,
                  ]}
                >
                  Unread ({unreadCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter("mentions")}
                style={[styles.filterTab, filter === "mentions" && styles.filterTabActive]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === "mentions" && styles.filterTabTextActive,
                  ]}
                >
                  Mentions ({mentionsCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={displayedNotifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={Palette.accentMint} />
                <Text style={styles.emptyTitle}>You're all caught up!</Text>
                <Text style={styles.emptySubtitle}>
                  {filter === "unread"
                    ? "No unread notifications at the moment."
                    : "No notifications yet."}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const icon = getIconForType(item.type);
              return (
                <TouchableOpacity
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.8}
                  style={[styles.itemCard, !item.isRead && styles.itemCardUnread]}
                >
                  <View style={[styles.iconBox, { backgroundColor: `${icon.color}15` }]}>
                    <Ionicons name={icon.name} size={18} color={icon.color} />
                  </View>

                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.message}</Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemTime}>{item.timeAgo}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        {!item.isRead && (
                          <TouchableOpacity
                            onPress={() => markAsRead(item.id)}
                            style={styles.markReadBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="checkmark" size={13} color={Palette.oceanTeal} />
                            <Text style={styles.markReadText}>Mark read</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => handleDeleteNotification(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="trash-outline" size={13} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Footer: Open Full Screen Link */}
          <TouchableOpacity
            style={styles.fullScreenLink}
            onPress={() => {
              onClose();
              router.push("/notifications" as any);
            }}
          >
            <Text style={styles.fullScreenLinkText}>View All Notifications</Text>
            <Ionicons name="arrow-forward" size={14} color={Palette.oceanTeal} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    minHeight: 460,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  badge: {
    backgroundColor: "rgba(0, 168, 150, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.oceanTeal,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.oceanTeal,
    fontFamily: AppFonts.body,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(0, 168, 150, 0.12)",
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.oceanTeal,
    fontFamily: AppFonts.body,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabs: {
    flexDirection: "row",
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  filterTabActive: {
    backgroundColor: "#FFFFFF",
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Palette.textSecondary,
    fontFamily: AppFonts.body,
  },
  filterTabTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  itemCardUnread: {
    backgroundColor: "#202020",
    borderColor: "rgba(0, 168, 150, 0.35)",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.oceanTeal,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  itemTime: {
    fontSize: 11.5,
    color: Palette.textMuted,
    fontFamily: AppFonts.body,
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  markReadText: {
    fontSize: 11.5,
    color: Palette.oceanTeal,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: "center",
    fontFamily: AppFonts.body,
  },
  fullScreenLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    marginTop: 8,
  },
  fullScreenLinkText: {
    color: Palette.oceanTeal,
    fontSize: 13.5,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
});
