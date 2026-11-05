import React, { useState } from "react";
import {
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
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  type: "milestone" | "tribute" | "like" | "system" | "mentor";
  route?: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Mentorship Anniversary",
    message: "It’s been 3 years since Mrs. Anita Sharma guided you through your first publication.",
    timeAgo: "2 hours ago",
    isRead: false,
    type: "mentor",
    route: "/mentor-profile/m1",
  },
  {
    id: "notif-2",
    title: "Gratitude Post Liked",
    message: "Marcus Vance and 11 others appreciated your note honouring Dr. David Mitchell.",
    timeAgo: "5 hours ago",
    isRead: false,
    type: "like",
    route: "/saved-items",
  },
  {
    id: "notif-3",
    title: "Keepsake Preserved",
    message: "Your Open Letter “Say what's unsaid” was saved to your private keepsake collection.",
    timeAgo: "1 day ago",
    isRead: false,
    type: "tribute",
    route: "/memory-wall",
  },
  {
    id: "notif-4",
    title: "Milestone Reached",
    message: "Congratulations! You have recorded memories with 5 mentors across literature, engineering, and science.",
    timeAgo: "2 days ago",
    isRead: true,
    type: "milestone",
    route: "/profile",
  },
  {
    id: "notif-5",
    title: "Welcome to Honour Your Mentor",
    message: "Express quiet gratitude and create lasting keepsakes for those who shaped your path.",
    timeAgo: "3 days ago",
    isRead: true,
    type: "system",
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
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const handleNotificationPress = (notif: AppNotification) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.route) {
      onClose();
      router.push(notif.route as any);
    }
  };

  const displayedNotifications =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const getIconForType = (type: AppNotification["type"]) => {
    switch (type) {
      case "mentor":
        return { name: "person-outline" as const, color: Palette.accentMint };
      case "like":
        return { name: "heart-outline" as const, color: Palette.accentPink };
      case "tribute":
        return { name: "mail-outline" as const, color: Palette.turquoise };
      case "milestone":
        return { name: "trophy-outline" as const, color: Palette.accentAmber };
      default:
        return { name: "sparkles-outline" as const, color: Palette.accentSky };
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
                    <Ionicons name="checkmark-done" size={16} color={Palette.accentSky} />
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
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.itemMessage}>{item.message}</Text>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemTime}>{item.timeAgo}</Text>
                      {!item.isRead && (
                        <TouchableOpacity
                          onPress={() => markAsRead(item.id)}
                          style={styles.markReadBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="checkmark" size={13} color={Palette.accentSky} />
                          <Text style={styles.markReadText}>Mark as Read</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "82%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontFamily: AppFonts?.displaySans,
  },
  badge: {
    backgroundColor: "rgba(143, 211, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.35)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.accentSky,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.accentSky,
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
    marginTop: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  filterTabActive: {
    backgroundColor: "#FFFFFF",
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#888888",
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
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#1F1F1F",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  itemCardUnread: {
    backgroundColor: "#242424",
    borderColor: "rgba(143, 211, 255, 0.25)",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.accentSky,
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: "#BBBBBB",
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTime: {
    fontSize: 11,
    color: "#666666",
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(143, 211, 255, 0.12)",
  },
  markReadText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.accentSky,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#888888",
    textAlign: "center",
  },
});
