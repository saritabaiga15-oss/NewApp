import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
    draftId?: string;
  }>();
  const savedDraft = params.draftId
    ? tributeDraftService.getDraftById(params.draftId)
    : undefined;
  const [tributeId, setTributeId] = useState(
    () => savedDraft?.payload.id || params.draftId || `tribute-${Date.now()}`
  );
  const createdAtRef = React.useRef(
    savedDraft?.payload.createdAt || new Date().toISOString()
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Screen Form State (persisting any incoming navigation params)
  const [mentorName, setMentorName] = useState(
    savedDraft?.payload.mentorName || params.mentorName || ""
  );
  const [relationship, setRelationship] = useState<TributeRelationship>(
    toTributeRelationship(savedDraft?.payload.relationship || params.relationship)
  );
  const [story, setStory] = useState(
    savedDraft?.payload.story ||
      params.story ||
      (params.promptQuestion ? `${params.promptQuestion}\n\n` : "")
  );

  // Photo state
  const [photoUri, setPhotoUri] = useState<string | null>(
    savedDraft?.payload.photoUri || null
  );
  const [isCustomPhoto, setIsCustomPhoto] = useState(
    savedDraft?.payload.isCustomPhoto ?? false
  );

  // Active Inspiration Card / Prompt tracking
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activePromptText, setActivePromptText] = useState<string | null>(
    savedDraft?.payload.inspirationPrompt || params.promptQuestion || null
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

  React.useEffect(() => {
    let active = true;
    tributeDraftService
      .initialize()
      .then(() => {
        if (!active) return;
        const draft = params.draftId
          ? tributeDraftService.getDraftById(params.draftId)
          : undefined;
        if (draft) {
          setTributeId(draft.payload.id);
          createdAtRef.current = draft.payload.createdAt;
          setMentorName(draft.payload.mentorName);
          setRelationship(toTributeRelationship(draft.payload.relationship));
          setStory(draft.payload.story);
          setPhotoUri(draft.payload.photoUri || null);
          setIsCustomPhoto(draft.payload.isCustomPhoto);
          setActivePromptText(draft.payload.inspirationPrompt || null);
          setSelectedCardId(null);
          tributeDraftService.setPayload(draft.payload);
          if (draft.designState) {
            tributeDraftService.setDesignState(draft.designState);
          }
        } else if (params.draftId) {
          Alert.alert("Draft not found", "This appreciation draft could not be found.");
        }
        setIsHydrated(true);
      })
      .catch((error: unknown) => {
        console.error("Unable to load appreciation draft:", error);
        if (active) {
          Alert.alert("Draft unavailable", "Your appreciation draft could not be loaded.");
          setIsHydrated(true);
        }
      });
    return () => {
      active = false;
    };
  }, [params.draftId]);

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

  const buildPayload = React.useCallback((): TributePayload => ({
    id: tributeId,
    mentorName: mentorName.trim(),
    relationship,
    photoUri: photoUri || DEFAULT_SAMPLE_PORTRAIT,
    isCustomPhoto,
    story: story.trim(),
    inspirationPrompt: activePromptText || undefined,
    createdAt: createdAtRef.current,
  }), [tributeId, mentorName, relationship, photoUri, isCustomPhoto, story, activePromptText]);

  React.useEffect(() => {
    if (!isHydrated) return;
    const hasContent =
      mentorName.trim() || story.trim() || isCustomPhoto || activePromptText;
    if (!hasContent) return;
    const timeout = setTimeout(() => {
      const design = tributeDraftService.getDesignState();
      tributeDraftService
        .saveDraft(
          buildPayload(),
          design?.id === tributeId ? design : null
        )
        .catch((error: unknown) => {
          console.error("Unable to autosave appreciation draft:", error);
          Alert.alert("Draft not saved", "Your appreciation draft could not be saved.");
        });
    }, 700);
    return () => clearTimeout(timeout);
  }, [
    isHydrated,
    mentorName,
    story,
    isCustomPhoto,
    activePromptText,
    buildPayload,
    tributeId,
  ]);

  const handleSaveDraft = async () => {
    const payload = buildPayload();
    try {
      await tributeDraftService.saveDraft(
        payload,
        tributeDraftService.getDesignState()?.id === tributeId
          ? tributeDraftService.getDesignState()
          : null
      );
      Alert.alert("Draft Saved", "Your appreciation card and photo have been saved in your studio.");
    } catch (error) {
      console.error("Unable to save tribute draft:", error);
      Alert.alert("Could not save draft", "Please check device storage and try again.");
    }
  };

  // Handle "Continue to Design" submission & validation
  const handleContinueToDesign = async () => {
    if (!mentorName.trim()) {
      setValidationError("Please enter the name of the person you are celebrating.");
      return;
    }

    if (!story.trim()) {
      setValidationError("Please write a memory or lesson to cherish.");
      return;
    }

    setValidationError(null);

    const payload = buildPayload();

    // Store safely in shared state service
    tributeDraftService.setPayload(payload);
    try {
      const design = tributeDraftService.getDesignState();
      await tributeDraftService.saveDraft(
        payload,
        design?.id === tributeId ? design : null
      );
    } catch (error) {
      console.error("Unable to update tribute draft:", error);
      setValidationError("Your draft could not be saved. Please try again.");
      return;
    }

    // Navigate to Tribute Design Studio screen with parameters
    router.push({
      pathname: "/tribute-design",
      params: {
        id: payload.id,
        name: payload.mentorName,
        relationship: payload.relationship,
        photoUri: payload.photoUri || undefined,
        story: payload.story,
      },
    });
  };

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
        <View style={[styles.mainContainer, { alignItems: "center", justifyContent: "center" }]}>
          <ActivityIndicator color={Palette.accentAmber} />
          <Text style={{ color: Palette.textSecondary, marginTop: 12 }}>
            Restoring your appreciation draft…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />

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
                  "Appreciation Options",
                  "You can save this appreciation card as a draft or discard changes anytime.",
                  [
                    { text: "Continue Editing", style: "cancel" },
                    {
                      text: "Save as Draft",
                      onPress: () => {
                        handleSaveDraft();
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
            {/* 7. MINIATURE APPRECIATION PREVIEW: Live Keepsake Card Preview */}
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
  bottomSpacer: {
    height: 120,
  },
});
