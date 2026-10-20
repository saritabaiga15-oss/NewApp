import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Palette } from "@/constants/theme";

export interface TimelineNode {
  year: string;
  title: string;
  subtitle: string;
  mentorName: string;
  isMilestone?: boolean;
}

interface TimelinePreviewProps {
  nodes: TimelineNode[];
  onViewFullPress?: () => void;
}

export default function TimelinePreview({
  nodes,
  onViewFullPress,
}: TimelinePreviewProps) {
  return (
    <View style={styles.wrapper}>
      {/* Deep crimson gradient card background */}
      <LinearGradient
        colors={["#3A0009", "#54000E", "#6B1020"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      {/* Decorative glow orb top-right */}
      <View style={styles.glowOrb} />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {/* Label pill */}
          <View style={styles.labelPill}>
            <Ionicons name="git-branch-outline" size={11} color={Palette.turquoise} />
            <Text style={styles.labelText}>YOUR JOURNEY</Text>
          </View>
          <Text style={styles.sectionTitle}>Journey Together</Text>
          <Text style={styles.sectionSubtitle}>
            Turning points &amp; growth across the years
          </Text>
        </View>

        <TouchableOpacity
          onPress={onViewFullPress}
          activeOpacity={0.75}
          style={styles.viewFullBtn}
        >
          <Text style={styles.viewFullText}>Full Timeline</Text>
          <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Timeline */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineScroll}
      >
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          const isMilestone = node.isMilestone ?? false;

          return (
            <View key={`node-${index}`} style={styles.nodeWrapper}>
              {/* Track row: dot + connector */}
              <View style={styles.trackRow}>
                {/* Milestone outer ring */}
                <View style={[styles.dotRing, isMilestone && styles.dotRingMilestone]}>
                  {/* Inner pulse */}
                  {isMilestone && <View style={styles.dotPulse} />}
                  <View style={[styles.dotCore, isMilestone && styles.dotCoreMilestone]} />
                </View>

                {/* Dashed / solid connector */}
                {!isLast && (
                  <View style={styles.connectorTrack}>
                    {[...Array(6)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.connectorDash,
                          isMilestone && styles.connectorDashMilestone,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Node Card */}
              <View style={[styles.nodeCard, isMilestone && styles.nodeCardMilestone]}>
                {/* Year badge */}
                <View style={[styles.yearBadge, isMilestone && styles.yearBadgeMilestone]}>
                  {isMilestone && (
                    <Ionicons name="star" size={9} color={Palette.turquoise} style={{ marginRight: 3 }} />
                  )}
                  <Text style={[styles.yearText, isMilestone && styles.yearTextMilestone]}>
                    {node.year}
                  </Text>
                </View>

                <Text style={styles.nodeTitle} numberOfLines={2}>
                  {node.title}
                </Text>

                <View style={styles.mentorRow}>
                  <Ionicons name="person-circle-outline" size={12} color={Palette.turquoise} />
                  <Text style={styles.nodeMentor} numberOfLines={1}>
                    {node.mentorName}
                  </Text>
                </View>

                <Text style={styles.nodeSubtitle} numberOfLines={2}>
                  {node.subtitle}
                </Text>

                {/* Bottom accent line */}
                <View style={[styles.cardAccentLine, isMilestone && styles.cardAccentLineMilestone]} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: "#3A0009",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
    minHeight: 220,
  },
  gradientBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 26,
  },
  glowOrb: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(236, 143, 62, 0.12)",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  labelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(236, 143, 62, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  labelText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Palette.turquoise,
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 248, 240, 0.6)",
    fontWeight: "500",
    lineHeight: 17,
  },
  viewFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginTop: 2,
  },
  viewFullText: {
    fontSize: 11.5,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* Timeline Scroll */
  timelineScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nodeWrapper: {
    width: 148,
    marginRight: 8,
  },

  /* Track */
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    height: 22,
  },
  dotRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255, 248, 240, 0.25)",
    backgroundColor: "rgba(255, 248, 240, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  dotRingMilestone: {
    borderColor: Palette.turquoise,
    backgroundColor: "rgba(236, 143, 62, 0.15)",
    shadowColor: Palette.turquoise,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  dotPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  dotCore: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "rgba(255, 248, 240, 0.45)",
  },
  dotCoreMilestone: {
    backgroundColor: Palette.turquoise,
    shadowColor: Palette.turquoise,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  connectorTrack: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginLeft: 4,
  },
  connectorDash: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255, 248, 240, 0.2)",
  },
  connectorDashMilestone: {
    backgroundColor: "rgba(236, 143, 62, 0.4)",
  },

  /* Node Card */
  nodeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 248, 240, 0.12)",
    padding: 13,
    position: "relative",
    overflow: "hidden",
  },
  nodeCardMilestone: {
    backgroundColor: "rgba(236, 143, 62, 0.12)",
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 248, 240, 0.1)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    marginBottom: 7,
  },
  yearBadgeMilestone: {
    backgroundColor: "rgba(236, 143, 62, 0.2)",
  },
  yearText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "rgba(255, 248, 240, 0.7)",
    letterSpacing: 0.3,
  },
  yearTextMilestone: {
    color: Palette.turquoise,
    fontWeight: "800",
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 18,
    marginBottom: 5,
    letterSpacing: -0.1,
  },
  mentorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },
  nodeMentor: {
    fontSize: 10.5,
    color: Palette.turquoise,
    fontWeight: "700",
    flex: 1,
  },
  nodeSubtitle: {
    fontSize: 11,
    lineHeight: 15.5,
    color: "rgba(255, 248, 240, 0.55)",
    fontWeight: "500",
  },
  cardAccentLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 248, 240, 0.08)",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cardAccentLineMilestone: {
    backgroundColor: Palette.turquoise,
    opacity: 0.6,
  },
});
