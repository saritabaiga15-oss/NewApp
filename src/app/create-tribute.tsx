import React, { useMemo, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

// Design System
import { Palette } from "@/constants/theme";

// Create Tribute Editorial Components
import {
  TributeDesignFooter,
  TributeHeader,
  TributeHeroEditorial,
  TributeInspirationCards,
  TributeMiniPreview,
  TributePersonSection,
  TributePhotoPicker,
  TributeStorySection,
} from "@/components/CreateTribute";
import BottomNavigation from "@/components/home/BottomNavigation";

// Types, Data & Services
import { TributePayload, TributeRelationship } from "@/types/create";
import {
  DEFAULT_SAMPLE_PORTRAIT,
  INSPIRATION_STORY_CARDS,
} from "@/data/tributeDetailsData";
import { tributeDraftService } from "@/services/tributeDraftService";

export default function CreateTributeScreen() {
  const params = useLocalSearchParams<{
    promptQuestion?: string;
    mentorName?: string;
    story?: string;
    relationship?: string;
  }>();

  // Screen Form State (persisting any incoming navigation params)
  const [mentorName, setMentorName] = useState(params.mentorName || "");
  const [relationship, setRelationship] = useState<TributeRelationship>(
    (params.relationship as TributeRelationship) || "Teacher"
  );
  const [story, setStory] = useState(
    params.story || (params.promptQuestion ? `${params.promptQuestion}\n\n` : "")
  );

  // Photo state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);

  // Active Inspiration Card / Prompt tracking
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activePromptText, setActivePromptText] = useState<string | null>(
    params.promptQuestion || null
  );

  // Validation Error Banner state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Smooth entrance animation
  const entranceFade = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(entranceFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entranceFade]);

  // Handle Photo Picker selection
  const handlePhotoSelected = (uri: string, isCustom: boolean) => {
    setPhotoUri(uri);
    setIsCustomPhoto(isCustom);
  };

  const handlePhotoRemoved = () => {
    setPhotoUri(null);
    setIsCustomPhoto(false);
  };

  // Handle Inspiration Card tap: injects prompt into the story area
  const handleSelectInspiration = (promptText: string, cardId: string) => {
    setSelectedCardId(cardId);
    setActivePromptText(promptText);

    // If story is currently empty, initialize with prompt text
    if (!story.trim()) {
      setStory(promptText + "\n\n");
    } else if (!story.includes(promptText)) {
      setStory((prev) => prev.trim() + "\n\n" + promptText + "\n");
    }
  };

  // Handle "Continue to Design" submission & validation
  const handleContinueToDesign = () => {
    if (!mentorName.trim()) {
      setValidationError("Please enter the name of the person you are celebrating.");
      return;
    }

    if (!story.trim()) {
      setValidationError("Please write a memory or lesson to cherish.");
      return;
    }

    setValidationError(null);

    const payload: TributePayload = {
      mentorName: mentorName.trim(),
      relationship,
      photoUri: photoUri || DEFAULT_SAMPLE_PORTRAIT,
      isCustomPhoto,
      story: story.trim(),
      inspirationPrompt: activePromptText || undefined,
      createdAt: new Date().toISOString(),
    };

    // Store safely in shared state service
    tributeDraftService.setPayload(payload);

    // Navigate to Tribute Design Studio screen with parameters
    router.push({
      pathname: "/tribute-design",
      params: {
        name: payload.mentorName,
        relationship: payload.relationship,
        photoUri: payload.photoUri || undefined,
        story: payload.story,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.iceWhite} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <Animated.View style={[styles.mainContainer, { opacity: entranceFade }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ======================================================== */}
            {/* 1. HEADER: Title, Subtitle, Back & Options               */}
            {/* ======================================================== */}
            <TributeHeader
              onBack={() => router.back()}
              onOptionsPress={() => {
                Alert.alert(
                  "Tribute Options",
                  "You can save this tribute as a draft or discard changes anytime.",
                  [
                    { text: "Continue Editing", style: "cancel" },
                    {
                      text: "Save as Draft",
                      onPress: () => {
                        Alert.alert("Draft Saved", "Your tribute draft has been saved.");
                      },
                    },
                  ]
                );
              }}
            />

            {/* ======================================================== */}
            {/* 2. EDITORIAL HERO: Layered Mentor & Student Photo        */}
            {/* ======================================================== */}
            <TributeHeroEditorial />

            {/* ======================================================== */}
            {/* 3. PHOTO SELECTION AREA: Gallery Picker & Sample Portrait*/}
            {/* ======================================================== */}
            <TributePhotoPicker
              currentPhotoUri={photoUri}
              isCustomPhoto={isCustomPhoto}
              onPhotoSelected={handlePhotoSelected}
              onPhotoRemoved={handlePhotoRemoved}
            />

            {/* ======================================================== */}
            {/* 4. WHO ARE WE CELEBRATING: Name Input & Relationship     */}
            {/* ======================================================== */}
            <TributePersonSection
              name={mentorName}
              relationship={relationship}
              onNameChange={(text) => {
                setMentorName(text);
                if (validationError) setValidationError(null);
              }}
              onRelationshipChange={setRelationship}
            />

            {/* ======================================================== */}
            {/* 5. A LITTLE INSPIRATION: 3 Horizontal Photographic Cards */}
            {/* ======================================================== */}
            <TributeInspirationCards
              cards={INSPIRATION_STORY_CARDS}
              selectedCardId={selectedCardId}
              onSelectInspiration={handleSelectInspiration}
            />

            {/* ======================================================== */}
            {/* 6. TELL THEIR STORY: Journal Multiline & Starter Question*/}
            {/* ======================================================== */}
            <TributeStorySection
              story={story}
              onStoryChange={(text) => {
                setStory(text);
                if (validationError) setValidationError(null);
              }}
              activePrompt={activePromptText}
              onApplyPromptText={(prompt) => setStory((prev) => prev + "\n" + prompt)}
            />

            {/* ======================================================== */}
            {/* 7. MINIATURE TRIBUTE PREVIEW: Live Keepsake Card Preview */}
            {/* ======================================================== */}
            <TributeMiniPreview
              name={mentorName}
              relationship={relationship}
              photoUri={photoUri || DEFAULT_SAMPLE_PORTRAIT}
              story={story}
            />

            {/* ======================================================== */}
            {/* 8. CONTINUE TO DESIGN BUTTON: Validation & Next Studio   */}
            {/* ======================================================== */}
            <TributeDesignFooter
              onContinue={handleContinueToDesign}
              errorMessage={validationError}
            />

            {/* Bottom Spacing so content is never covered by bottom nav */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Floating Bottom Navigation Bar (Active: Create) */}
      <BottomNavigation activeTab="create" />
    </SafeAreaView>
  );
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
  bottomSpacer: {
    height: 120,
  },
});
