import React, { useMemo, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Design System
import { Palette } from "@/constants/theme";

// Create Screen Editorial Components
import {
  CreateHeader,
  CreationCardsSection,
  CreationFlowModal,
  DraftsSection,
  InspirationJournal,
} from "@/components/Create";
import BottomNavigation from "@/components/home/BottomNavigation";

// Types & Data
import {
  CreationDraft,
  CreationFormState,
  CreationType,
  InspirationPrompt,
} from "@/types/create";
import { CREATION_OPTIONS, INSPIRATION_PROMPTS } from "@/data/createStudioData";

export default function CreateScreen() {
  // Studio selections & modals
  const [selectedCreationType, setSelectedCreationType] = useState<CreationType>("tribute");
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [activePromptForCreation, setActivePromptForCreation] = useState<InspirationPrompt | null>(null);
  const [activeDraftForEdit, setActiveDraftForEdit] = useState<CreationDraft | null>(null);

  // Real user drafts (starts empty to preserve integrity without fabricated content)
  const [drafts, setDrafts] = useState<CreationDraft[]>([]);

  // Feedback toast banner
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

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  };

  // Handle card selection: opens the respective creation flow
  const handleSelectOption = (type: CreationType) => {
    if (type === "tribute") {
      router.push("/create-tribute");
      return;
    }
    setSelectedCreationType(type);
    setActivePromptForCreation(null);
    setActiveDraftForEdit(null);
    setIsStudioModalOpen(true);
  };

  // Handle Inspiration "Start Creating" button
  const handleStartFromInspiration = (prompt: InspirationPrompt) => {
    if (prompt.suggestedType === "tribute") {
      router.push({
        pathname: "/create-tribute",
        params: {
          promptQuestion: prompt.question,
        },
      });
      return;
    }
    setSelectedCreationType(prompt.suggestedType);
    setActivePromptForCreation(prompt);
    setActiveDraftForEdit(null);
    setIsStudioModalOpen(true);
  };

  // Handle resuming a draft
  const handleResumeDraft = (draft: CreationDraft) => {
    if (draft.type === "tribute") {
      router.push({
        pathname: "/create-tribute",
        params: {
          mentorName: draft.mentorName,
          story: draft.previewText,
        },
      });
      return;
    }
    setSelectedCreationType(draft.type);
    setActivePromptForCreation(null);
    setActiveDraftForEdit(draft);
    setIsStudioModalOpen(true);
  };

  // Discard draft
  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      "Discard Draft?",
      "Are you sure you want to remove this memory draft?",
      [
        { text: "Keep Draft", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setDrafts((prev) => prev.filter((d) => d.id !== draftId));
            showToast("Draft removed from studio");
          },
        },
      ]
    );
  };

  // Save as draft handler
  const handleSaveDraft = (newDraft: CreationDraft) => {
    setDrafts((prev) => {
      const exists = prev.findIndex((d) => d.id === newDraft.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newDraft;
        return updated;
      }
      return [newDraft, ...prev];
    });
    showToast("Memory draft saved to studio");
  };

  // Publish / complete creation handler
  const handlePublishCreation = (formData: CreationFormState) => {
    // If was editing a draft, remove it from drafts
    if (activeDraftForEdit) {
      setDrafts((prev) => prev.filter((d) => d.id !== activeDraftForEdit.id));
    }

    const mentor = formData.mentorName || "your mentor";
    showToast(`Honoured ${mentor} in your memories`);

    Alert.alert(
      "Memory Celebrated",
      `Your ${formData.type} for ${mentor} has been captured in your personal collection.`,
      [{ text: "Cherish It", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.iceWhite} />

      {/* Warm Background Parchment Canvas */}
      <View style={styles.paperCanvas} />

      {/* Main Studio Viewport */}
      <Animated.View style={[styles.mainContainer, { opacity: entranceFade }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ======================================================== */}
          {/* 1. DISTINCTIVE HEADER: Let's celebrate someone           */}
          {/* ======================================================== */}
          <CreateHeader draftCount={drafts.length} />

          {/* Toast Notification Banner */}
          {toastMessage && (
            <Animated.View style={[styles.toastBanner, { opacity: toastFade }]}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={Palette.pureWhite}
              />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          )}

          {/* ======================================================== */}
          {/* 2. MAIN SECTION: What Would You Like to Create? (4 Cards)*/}
          {/* ======================================================== */}
          <CreationCardsSection
            options={CREATION_OPTIONS}
            selectedType={selectedCreationType}
            onSelectOption={handleSelectOption}
          />

          {/* ======================================================== */}
          {/* 3. INSPIRATION SECTION: A Thought Worth Keeping          */}
          {/* ======================================================== */}
          <InspirationJournal
            prompts={INSPIRATION_PROMPTS}
            onStartCreating={handleStartFromInspiration}
          />

          {/* ======================================================== */}
          {/* 4. RECENT CREATIONS: Pick Up Where You Left Off          */}
          {/* ======================================================== */}
          <DraftsSection
            drafts={drafts}
            onResumeDraft={handleResumeDraft}
            onDeleteDraft={handleDeleteDraft}
            onStartFirstMemory={() => handleSelectOption("tribute")}
          />

          {/* Bottom Spacing to ensure bottom navigation does not obscure content */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>

      {/* Floating Bottom Navigation Bar (Active: Create) */}
      <BottomNavigation activeTab="create" />

      {/* Interactive Creation Studio Flow Modal */}
      <CreationFlowModal
        visible={isStudioModalOpen}
        creationType={selectedCreationType}
        initialPrompt={activePromptForCreation}
        initialDraft={activeDraftForEdit}
        onClose={() => setIsStudioModalOpen(false)}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublishCreation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  paperCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.iceWhite,
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
    height: 115,
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Palette.pureWhite,
  },
});
