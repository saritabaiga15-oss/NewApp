import React, { useMemo, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Design System
import { Palette } from "@/constants/theme";

// Studio Components
import {
  TributeCanvas,
  TributeStudioHeader,
  TributeStudioToolbar,
  TributeTemplateSelector,
} from "@/components/TributeStudio";
import BottomNavigation from "@/components/home/BottomNavigation";

// Types, Data & Services
import {
  TributeDecorationId,
  TributeDesignState,
  TributeFrameStyle,
  TributeRelationship,
  TributeTemplateId,
  TributeTypographyStyle,
} from "@/types/create";
import { CURATED_QUOTES, STUDIO_TEMPLATES } from "@/data/tributeStudioData";
import { DEFAULT_SAMPLE_PORTRAIT } from "@/data/tributeDetailsData";
import { tributeDraftService } from "@/services/tributeDraftService";

export default function TributeDesignScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    relationship?: string;
    story?: string;
    photoUri?: string;
  }>();

  const storedPayload = tributeDraftService.getPayload();
  const existingPayload =
    storedPayload && storedPayload.id === params.id ? storedPayload : null;
  const storedDesign = tributeDraftService.getDesignState();
  const existingDesign =
    storedDesign && storedDesign.id === params.id ? storedDesign : null;
  const [tributeId] = useState(
    () => params.id || `tribute-${Date.now()}`
  );

  // Design Studio States
  const [mentorName] = useState(
    existingDesign?.mentorName ||
      existingPayload?.mentorName ||
      params.name ||
      ""
  );
  const [relationship] = useState<TributeRelationship>(
    existingDesign?.relationship ||
      existingPayload?.relationship ||
      toTributeRelationship(params.relationship)
  );
  const [story] = useState(
    existingDesign?.story ||
      existingPayload?.story ||
      params.story ||
      ""
  );
  const [photoUri, setPhotoUri] = useState(
    existingDesign?.photoUri ||
      existingPayload?.photoUri ||
      params.photoUri ||
      DEFAULT_SAMPLE_PORTRAIT
  );
  const [isCustomPhoto, setIsCustomPhoto] = useState(
    existingDesign?.isCustomPhoto ?? existingPayload?.isCustomPhoto ?? false
  );

  // Creative customizer state
  const [selectedTemplate, setSelectedTemplate] = useState<TributeTemplateId>(
    existingDesign?.templateId || "editorial"
  );
  const [selectedFrame, setSelectedFrame] = useState<TributeFrameStyle>(
    existingDesign?.frameStyle || "clean"
  );
  const [selectedTypography, setSelectedTypography] = useState<TributeTypographyStyle>(
    existingDesign?.typographyStyle || "serif"
  );
  const [textAlign, setTextAlign] = useState<"left" | "center">(
    existingDesign?.textAlign || "left"
  );
  const [quote, setQuote] = useState(
    existingDesign?.quote || CURATED_QUOTES[0]
  );
  const [activeDecorations, setActiveDecorations] = useState<TributeDecorationId[]>(
    existingDesign?.decorations || ["wax-seal", "sparkle-star"]
  );

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastFade = useMemo(() => new Animated.Value(0), []);

  // Smooth entrance animation
  const entranceFade = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(entranceFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entranceFade]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  // Stable Tribute ID initialized once
  // Build current Design State object
  const currentDesign: TributeDesignState = useMemo(
    () => ({
      id: tributeId,
      mentorName,
      relationship,
      photoUri,
      isCustomPhoto,
      story,
      quote,
      customTitle: "A Tribute to Guidance",
      templateId: selectedTemplate,
      frameStyle: selectedFrame,
      typographyStyle: selectedTypography,
      textAlign,
      decorations: activeDecorations,
      createdAt: existingDesign?.createdAt || existingPayload?.createdAt || new Date().toISOString(),
    }),
    [
      tributeId,
      existingDesign?.createdAt,
      existingPayload?.createdAt,
      mentorName,
      relationship,
      photoUri,
      isCustomPhoto,
      story,
      quote,
      selectedTemplate,
      selectedFrame,
      selectedTypography,
      textAlign,
      activeDecorations,
    ]
  );

  // Decoration toggle handler
  const handleToggleDecoration = (decoId: TributeDecorationId) => {
    setActiveDecorations((prev) =>
      prev.includes(decoId) ? prev.filter((d) => d !== decoId) : [...prev, decoId]
    );
  };

  // Photo handlers
  const handlePhotoSelected = (uri: string, isCustom: boolean) => {
    setPhotoUri(uri);
    setIsCustomPhoto(isCustom);
    showToast("Photo updated on canvas");
  };

  const handlePhotoRemoved = () => {
    setPhotoUri(DEFAULT_SAMPLE_PORTRAIT);
    setIsCustomPhoto(false);
    showToast("Reset to sample portrait");
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    const payload = {
      id: currentDesign.id,
      mentorName: currentDesign.mentorName,
      relationship: currentDesign.relationship,
      photoUri: currentDesign.photoUri,
      isCustomPhoto: currentDesign.isCustomPhoto,
      story: currentDesign.story,
      inspirationPrompt: existingPayload?.inspirationPrompt,
      createdAt: currentDesign.createdAt,
    };
    tributeDraftService.setPayload(payload);
    tributeDraftService.setDesignState(currentDesign);
    try {
      await tributeDraftService.saveDraft(payload, currentDesign);
      showToast("Design draft safely preserved");
      Alert.alert(
        "Draft Saved",
        `Your heirloom keepsake for ${mentorName} has been saved to your studio.`
      );
    } catch (error) {
      console.error("Unable to save design draft:", error);
      Alert.alert("Could not save draft", "Please check device storage and try again.");
    }
  };

  // Preview Action
  const handleOpenPreview = () => {
    tributeDraftService.setDesignState(currentDesign);
    router.push("/tribute-preview");
  };

  const handleBackToDetails = () => {
    tributeDraftService.setDesignState(currentDesign);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <Animated.View style={[styles.mainContainer, { opacity: entranceFade }]}>
          {/* Header */}
          <TributeStudioHeader
            onBack={handleBackToDetails}
            onSaveDraft={handleSaveDraft}
            onPreview={handleOpenPreview}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <Animated.View style={[styles.toastBanner, { opacity: toastFade }]}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={Palette.pureWhite}
              />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ======================================================== */}
            {/* 1. MAIN EDITING CANVAS                                   */}
            {/* ======================================================== */}
            <View style={styles.canvasWrapper}>
              <TributeCanvas design={currentDesign} />
            </View>

            {/* Tap to Preview Quick Pill */}
            <TouchableOpacity
              onPress={handleOpenPreview}
              activeOpacity={0.8}
              style={styles.quickPreviewPill}
              accessibilityRole="button"
              accessibilityLabel="Tap to preview tribute in full presentation"
            >
              <Ionicons name="eye" size={14} color={Palette.oceanTeal} />
              <Text style={styles.quickPreviewPillText}>
                Tap canvas to view in full keepsake preview
              </Text>
            </TouchableOpacity>

            {/* ======================================================== */}
            {/* 2. TEMPLATE SELECTOR (6 Editorial Designs)               */}
            {/* ======================================================== */}
            <TributeTemplateSelector
              templates={STUDIO_TEMPLATES}
              selectedTemplateId={selectedTemplate}
              onSelectTemplate={(tmplId) => {
                setSelectedTemplate(tmplId);
                showToast(`Applied ${tmplId.toUpperCase()} template`);
              }}
            />

            {/* ======================================================== */}
            {/* 3. EDITING TOOLBAR (Frames, Text, Decorations, Photos)   */}
            {/* ======================================================== */}
            <TributeStudioToolbar
              currentFrame={selectedFrame}
              onSelectFrame={(frame) => {
                setSelectedFrame(frame);
                showToast(`Applied ${frame} frame`);
              }}
              quote={quote}
              onQuoteChange={setQuote}
              typographyStyle={selectedTypography}
              onTypographyChange={(style) => {
                setSelectedTypography(style);
                showToast(`Applied ${style} typography`);
              }}
              textAlign={textAlign}
              onTextAlignChange={setTextAlign}
              activeDecorations={activeDecorations}
              onToggleDecoration={handleToggleDecoration}
              currentPhotoUri={photoUri}
              isCustomPhoto={isCustomPhoto}
              onPhotoSelected={handlePhotoSelected}
              onPhotoRemoved={handlePhotoRemoved}
            />

            {/* ======================================================== */}
            {/* 4. PROMINENT PREVIEW ACTION BUTTON                       */}
            {/* ======================================================== */}
            <View style={styles.previewActionWrap}>
              <Text style={styles.actionPromptText}>
                Satisfied with your composition?
              </Text>
              <TouchableOpacity
                onPress={handleOpenPreview}
                activeOpacity={0.85}
                style={styles.previewTributeBtn}
                accessibilityRole="button"
                accessibilityLabel="Preview finished tribute"
              >
                <View style={styles.btnTextCol}>
                  <Text style={styles.previewTributeBtnLabel}>
                    Preview Tribute
                  </Text>
                  <Text style={styles.previewTributeBtnSub}>
                    View finished keepsake presentation
                  </Text>
                </View>
                <View style={styles.arrowIconCircle}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={Palette.deepTeal}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ height: 115 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Floating Bottom Navigation Bar (Active: Create) */}
      <BottomNavigation activeTab="create" />
    </SafeAreaView>
  );
}

function toTributeRelationship(value?: string): TributeRelationship {
  switch (value) {
    case "Teacher":
    case "Parent":
    case "Coach":
    case "Friend":
    case "Leader":
    case "Other":
    case "Grandparent":
    case "Professor":
    case "Colleague":
    case "Spiritual Guide":
    case "Other Mentor":
    case "Literature Teacher":
    case "Research Advisor":
    case "Engineering Director":
    case "Art & Design Coach":
    case "Friend & Mentor":
      return value;
    default:
      return "Other";
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  keyboardContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  toastText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
  canvasWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  quickPreviewPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    marginHorizontal: 24,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
    marginBottom: 6,
  },
  quickPreviewPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.oceanTeal,
  },
  previewActionWrap: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  actionPromptText: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  previewTributeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.35)",
  },
  btnTextCol: {},
  previewTributeBtnLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.pureWhite,
    letterSpacing: -0.2,
  },
  previewTributeBtnSub: {
    fontSize: 11,
    color: "rgba(252, 238, 228, 0.75)",
    marginTop: 2,
  },
  arrowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
  },
});
