import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Palette } from "@/constants/theme";

export default function OnboardingScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Smooth entrance animation
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(16), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Responsive sizing for collage cards
  const cardWidth = Math.min(136, Math.max(105, Math.floor((windowWidth - 36) / 2.75)));
  const cardHeight = Math.round(cardWidth * 1.38);
  const collageHeight = Math.round(windowHeight * 0.48);

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ========================================= */}
          {/* TOP PHOTO COLLAGE (3 Columns, 2 Rows)     */}
          {/* ========================================= */}
          <View style={[styles.collageContainer, { height: collageHeight }]}>
            <View style={styles.tiltedWrapper}>
              {/* Column 1: Team & Duo */}
              <View style={[styles.column, { paddingTop: 24 }]}>
                <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                  <Image
                    source={require("../../assets/images/img4.jpeg")}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                  <Image
                    source={require("../../assets/images/img1.jpeg")}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Column 2: Classroom & Mentor */}
              <View style={[styles.column, { paddingTop: 0 }]}>
                <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                  <Image
                    source={require("../../assets/images/img3.jpeg")}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                  <Image
                    source={require("../../assets/images/img2.jpeg")}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Column 3: Duo & Team */}
              <View style={[styles.column, { paddingTop: 28 }]}>
                <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                  <Image
                    source={require("../../assets/images/img1.jpeg")}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                  <Image
                    source={require("../../assets/images/img4.jpeg")}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            {/* Seamless Cream White fade into warm canvas */}
            <LinearGradient
              colors={[
                "rgba(255, 248, 240, 0)",
                "rgba(255, 248, 240, 0.65)",
                "rgba(255, 248, 240, 0.95)",
                Palette.iceWhite,
              ]}
              locations={[0, 0.45, 0.8, 1]}
              style={styles.bottomCollageGradient}
              pointerEvents="none"
            />
          </View>

          {/* ========================================= */}
          {/* HONOUR YOUR MENTOR CONTENT AREA           */}
          {/* ========================================= */}
          <Animated.View
            style={[
              styles.contentArea,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Title: Deep Teal Heading */}
            <Text style={styles.title}>
              Honour Your{"\n"}Mentor
            </Text>

            {/* Mint Mist Reflection Pill */}
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>
                Keep their memories, lessons, and impact{"\n"}
                close to your heart.
              </Text>
            </View>

            {/* "Get Started" Primary Button (Ocean Teal) */}
            <TouchableOpacity
              style={styles.getStartedButtonWrapper}
              activeOpacity={0.88}
              onPress={() => router.push("/login")}
            >
              <View style={styles.getStartedButton}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </View>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <View style={styles.loginRow}>
                <Text style={styles.loginPrompt}>Already have an account? </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.loginLink}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: Palette.iceWhite, // Ice White background
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 40,
  },

  /* IMAGE COLLAGE */
  collageContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tiltedWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    transform: [{ rotate: "-6deg" }],
    marginTop: -20,
    width: "125%",
  },
  column: {
    flexDirection: "column",
    gap: 14,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Palette.pureWhite,
    borderWidth: 1.5,
    borderColor: "rgba(236, 143, 62, 0.22)", // Turquoise delicate border
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  bottomCollageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },

  /* CONTENT AREA */
  contentArea: {
    paddingHorizontal: 28,
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: Palette.deepTeal, // Deep Teal heading
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  descriptionBox: {
    backgroundColor: Palette.mintMist, // Mint Mist soft pill
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
    marginBottom: 28,
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Palette.deepTeal, // Deep Teal text
    textAlign: "center",
    fontWeight: "700",
  },

  /* Primary "Get Started" Button */
  getStartedButtonWrapper: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  getStartedButton: {
    height: 56,
    backgroundColor: Palette.oceanTeal, // Ocean Teal primary button
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* FOOTER */
  footerContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginPrompt: {
    fontSize: 14,
    color: Palette.textSecondary,
    fontWeight: "500",
  },
  loginLink: {
    fontSize: 14,
    color: Palette.oceanTeal, // Ocean Teal link
    fontWeight: "800",
  },
});