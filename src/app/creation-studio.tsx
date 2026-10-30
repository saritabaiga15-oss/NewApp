import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { AppFonts, Palette } from "@/constants/theme";
import BottomNavigation from "@/components/home/BottomNavigation";
import { creationDraftService } from "@/services/creationDraftService";
import { memoryService } from "@/services/memoryService";
import { userProfileService } from "@/services/userProfileService";
import { api } from "@/services/api";
import type { CreationDraft, CreationFormState } from "@/types/create";

type StudioType = "memory" | "lesson" | "letter";

const NOTE_LAYOUTS = [
  { id: "botanical", label: "Botanical", icon: "leaf-outline" },
  { id: "postcard", label: "Postcard", icon: "mail-outline" },
  { id: "minimal", label: "Minimal", icon: "remove-outline" },
] as const;
const LETTER_PAPERS = [
  { id: "ivory", label: "Ivory", color: "#F6EDDD", ink: "#392C24" },
  { id: "rose", label: "Blush", color: "#F4E4E2", ink: "#432B30" },
  { id: "sage", label: "Sage", color: "#E6EADD", ink: "#29352D" },
] as const;
const NOTE_STICKERS = ["✦", "❀", "♡", "☼"];

function getParam(value?: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isStudioType(value: string): value is StudioType {
  return value === "memory" || value === "lesson" || value === "letter";
}

function typeTitle(type: StudioType): string {
  if (type === "memory") return "Write a Memo";
  if (type === "lesson") return "Write a Note";
  return "Open Letter";
}

function typeAccent(type: StudioType): string {
  if (type === "memory") return Palette.accentMint;
  if (type === "lesson") return Palette.accentLavender;
  return Palette.accentPink;
}

export default function CreationStudioScreen({
  initialType,
}: {
  initialType?: StudioType;
}) {
  const params = useLocalSearchParams<{
    type?: string | string[];
    mentorName?: string | string[];
    relationship?: string | string[];
    prompt?: string | string[];
    draftId?: string | string[];
  }>();
  const requestedType = initialType ?? getParam(params.type);
  const type: StudioType = isStudioType(requestedType) ? requestedType : "memory";
  const draftIdParam = getParam(params.draftId);
  const prompt = getParam(params.prompt);
  const accent = typeAccent(type);
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idRef = useRef(draftIdParam || `creation-draft-${reactId}`);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressAutosave = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [mentorName, setMentorName] = useState(getParam(params.mentorName));
  const [relationship, setRelationship] = useState(getParam(params.relationship) || "Mentor");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [quote, setQuote] = useState("");
  const [dateOrYear, setDateOrYear] = useState("");
  const [greeting, setGreeting] = useState("");
  const [closing, setClosing] = useState("With gratitude,");
  const [signature, setSignature] = useState(() => {
    const pName = userProfileService.getProfile().name;
    return pName && pName !== "Sarita Baiga" ? pName : "";
  });
  const [photoUri, setPhotoUri] = useState("");
  const [layoutStyle, setLayoutStyle] = useState(type === "letter" ? "ivory" : "botanical");
  const [decorations, setDecorations] = useState<string[]>([]);
  const [mentorEmail, setMentorEmail] = useState("");
  const [sendDedicationEmail, setSendDedicationEmail] = useState(true);
  const [isSharedOnFeed, setIsSharedOnFeed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const formData: CreationFormState = useMemo(
    () => ({
      type,
      mentorName,
      relationship,
      title,
      body,
      quote,
      dateOrYear,
      greeting,
      closing,
      signature,
      photoUri,
      layoutStyle,
      decorations,
    }),
    [
      type,
      mentorName,
      relationship,
      title,
      body,
      quote,
      dateOrYear,
      greeting,
      closing,
      signature,
      photoUri,
      layoutStyle,
      decorations,
    ]
  );

  const hydrateDraft = useCallback((draft: CreationDraft) => {
    const saved = draft.formData;
    if (!saved) return;
    setMentorName(saved.mentorName);
    setRelationship(saved.relationship);
    setTitle(saved.title);
    setBody(saved.body);
    setQuote(saved.quote ?? "");
    setDateOrYear(saved.dateOrYear ?? "");
    setGreeting(saved.greeting ?? "");
    setClosing(saved.closing ?? "With gratitude,");
    const authorName = userProfileService.getProfile().name;
    if (saved.signature && saved.signature !== "Sarita Baiga") {
      setSignature(saved.signature);
    } else {
      setSignature(authorName && authorName !== "Sarita Baiga" ? authorName : "");
    }
    setPhotoUri(saved.photoUri ?? "");
    setLayoutStyle(saved.layoutStyle ?? (saved.type === "letter" ? "ivory" : "botanical"));
    setDecorations(saved.decorations ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      creationDraftService.initialize(),
      userProfileService.initialize(),
    ])
      .then(() => {
        if (!active) return;
        const authorName = userProfileService.getProfile().name;
        const validAuthor = authorName && authorName !== "Sarita Baiga" ? authorName : "";
        if (draftIdParam) {
          const draft = creationDraftService.getDraftById(draftIdParam);
          if (draft?.type === type) hydrateDraft(draft);
          else if (!signature || signature === "Sarita Baiga") setSignature(validAuthor);
        } else {
          if (!signature || signature === "Sarita Baiga") setSignature(validAuthor);
        }
        setIsHydrated(true);
      })
      .catch((error: unknown) => {
        console.error("Unable to load creation draft:", error);
        if (active) {
          Alert.alert("Draft unavailable", "Your saved draft could not be loaded.");
          setIsHydrated(true);
        }
      });
    return () => {
      active = false;
    };
  }, [draftIdParam, hydrateDraft, type]);

  const makeDraft = useCallback(
    (data: CreationFormState): CreationDraft => ({
      id: idRef.current,
      type,
      title: data.title || typeTitle(type),
      mentorName: data.mentorName,
      previewText: data.body || data.quote || "",
      lastEdited: new Date().toLocaleString(),
      wordCount: data.body.trim().split(/\s+/).filter(Boolean).length,
      formData: data,
    }),
    [type]
  );

  const persistDraft = useCallback(
    async (data: CreationFormState) => {
      await creationDraftService.saveDraft(makeDraft(data));
    },
    [makeDraft]
  );

  useEffect(() => {
    if (!isHydrated || suppressAutosave.current) return;
    const hasContent =
      mentorName.trim() ||
      title.trim() ||
      body.trim() ||
      quote.trim() ||
      dateOrYear.trim() ||
      photoUri ||
      decorations.length > 0 ||
      layoutStyle !== (type === "letter" ? "ivory" : "botanical");
    if (!hasContent) return;
    const timeout = setTimeout(() => {
      persistDraft(formData).catch((error: unknown) => {
        console.error("Unable to autosave creation draft:", error);
        Alert.alert("Draft not saved", "Check your device storage and try again.");
      });
    }, 700);
    autosaveTimer.current = timeout;
    return () => {
      clearTimeout(timeout);
      if (autosaveTimer.current === timeout) autosaveTimer.current = null;
    };
  }, [
    isHydrated,
    mentorName,
    title,
    body,
    quote,
    dateOrYear,
    photoUri,
    decorations,
    layoutStyle,
    type,
    formData,
    persistDraft,
  ]);

  const handleBack = async () => {
    try {
      if (
        isHydrated &&
        (mentorName.trim() ||
          title.trim() ||
          body.trim() ||
          quote.trim() ||
          dateOrYear.trim() ||
          photoUri ||
          decorations.length > 0 ||
          layoutStyle !== (type === "letter" ? "ivory" : "botanical"))
      ) {
        await persistDraft(formData);
      }
      router.back();
    } catch (error) {
      console.error("Unable to preserve creation draft:", error);
      Alert.alert("Draft not saved", "Your writing could not be saved. Stay on this screen and try again.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      await persistDraft(formData);
      Alert.alert("Draft saved", "Your writing and design choices are saved in your creation studio.");
    } catch (error) {
      console.error("Unable to save creation draft:", error);
      Alert.alert("Draft not saved", "Your draft could not be saved. Please try again.");
    }
  };

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photo access needed", "Allow photo library access to attach a keepsake image.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
    } catch (error) {
      console.error("Unable to select an attachment:", error);
      Alert.alert("Photo unavailable", "The photo could not be selected. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!mentorName.trim()) {
      Alert.alert("Mentor name needed", "Add the person this keepsake is for.");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Add your words", `Write something in your ${type === "letter" ? "letter" : type === "memory" ? "memo" : "note"} before saving.`);
      return;
    }
    suppressAutosave.current = true;
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    setIsSaving(true);
    try {
      const createdAt = new Date().toISOString();
      const savedId = idRef.current.replace("creation-draft-", "creation-");
      const year = dateOrYear.match(/\d{4}/)?.[0] ?? String(new Date().getFullYear());
      if (type === "memory") {
        memoryService.addMemory({
          kind: "memory",
          id: savedId,
          mentorName: mentorName.trim(),
          relationship,
          title: title.trim() || "A Moment Cherished",
          excerpt: body.trim(),
          story: body.trim(),
          year,
          emotion: "Gratitude",
          emotionColor: Palette.accentMint,
          imageUri: photoUri || undefined,
          quote: quote.trim() || undefined,
          momentToRemember: dateOrYear.trim() || undefined,
          createdAt,
          isPinned: false,
        });
      } else if (type === "letter") {
        memoryService.addMemory({
          kind: "letter",
          id: savedId,
          mentorName: mentorName.trim(),
          relationship,
          title: title.trim() || `A Letter to ${mentorName.trim()}`,
          preview: body.trim().slice(0, 180),
          letterBody: body.trim(),
          salutation: greeting.trim() || `Dear ${mentorName.trim()},`,
          signoff: closing.trim(),
          signature: signature.trim(),
          paperStyle: layoutStyle,
          envelopeStyle: decorations.includes("envelope") ? "classic" : undefined,
          date: dateOrYear.trim() || undefined,
          wordCount: body.trim().split(/\s+/).filter(Boolean).length,
          mood: "Grateful",
          createdAt,
          isPinned: false,
        });
      } else {
        memoryService.addMemory({
          kind: "lesson",
          id: savedId,
          mentorName: mentorName.trim(),
          relationship,
          lessonTitle: title.trim() || "A Note for You",
          quote: quote.trim() || body.trim(),
          story: body.trim(),
          imageUri: photoUri || undefined,
          layoutStyle,
          decorations,
          category: "Note",
          createdAt,
          isPinned: false,
        });
      }
      try {
        await creationDraftService.removeDraft(idRef.current);
      } catch (error) {
        console.error("Unable to remove the completed creation draft:", error);
      }

      // Publish to backend with dedication email dispatch and community feed sharing
      try {
        await api.tributes.create({
          mentorName: mentorName.trim(),
          kind: type,
          title: title.trim() || (type === "letter" ? `A Letter to ${mentorName.trim()}` : "A Moment of Gratitude"),
          relationship: relationship || "Mentor",
          story: body.trim(),
          excerpt: body.trim().slice(0, 200),
          quote: quote.trim() || undefined,
          salutation: greeting.trim() || undefined,
          signoff: closing.trim() || undefined,
          signature: signature.trim() || userProfileService.getProfile().name,
          photoUri: photoUri || undefined,
          recipientEmail: mentorEmail.trim() || undefined,
          sendDedicationEmail: sendDedicationEmail && !!mentorEmail.trim(),
          isShared: isSharedOnFeed,
          privacy: isSharedOnFeed ? "PUBLIC" : "PRIVATE",
        });
      } catch (backendErr) {
        console.warn("Backend tribute sync:", backendErr);
      }

      const alertMsg = mentorEmail.trim() && sendDedicationEmail
        ? `Your post has been published and dedicated! We sent an email notification to ${mentorEmail.trim()} with the website link so your mentor can view it.`
        : isSharedOnFeed
        ? "Your post has been published and shared to your community feed & Memory Wall!"
        : "Your post is now saved in your collection.";

      Alert.alert("Published with Care", alertMsg, [
        { text: "Keep creating", style: "cancel", onPress: () => router.replace("/create") },
        {
          text: isSharedOnFeed ? "View on Memory Wall" : "View Keepsake",
          onPress: () => router.replace(isSharedOnFeed ? "/memory-wall" : { pathname: "/memory-detail/[id]", params: { id: savedId } }),
        },
      ]);
    } catch (error) {
      suppressAutosave.current = false;
      console.error("Unable to save creation:", error);
      Alert.alert("Could not save", "Your keepsake could not be saved. Please try again.");
      persistDraft(formData).catch((draftError: unknown) => {
        console.error("Unable to preserve creation after save failure:", draftError);
        Alert.alert("Draft not saved", "Your writing could not be preserved. Please try again.");
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const text = type === "letter"
      ? `${greeting || `Dear ${mentorName || "Mentor"},`}\n\n${body}\n\n${closing}\n${signature}`
      : `${title || typeTitle(type)}\n\n${body}${quote ? `\n\n“${quote}”` : ""}\n\nFor ${mentorName || "someone who matters"}`;
    try {
      await Share.share({ title: title || typeTitle(type), message: text });
    } catch (error) {
      console.error("Unable to share creation:", error);
      Alert.alert("Could not share", "Please try sharing again.");
    }
  };

  const isLetter = type === "letter";
  const isMemo = type === "memory";
  const selectedPaper = LETTER_PAPERS.find((paper) => paper.id === layoutStyle) ?? LETTER_PAPERS[0];
  const paperColor = isLetter ? selectedPaper.color : type === "lesson" && layoutStyle === "postcard" ? "#F4E8DE" : "#F6EFDF";
  const paperInk = isLetter ? selectedPaper.ink : "#3C342E";
  const screenTitle = typeTitle(type);

  if (!isStudioType(requestedType)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.invalidWrap}>
          <Text style={styles.invalidText}>Choose a creation type to begin.</Text>
          <Pressable onPress={() => router.replace("/create")} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Create</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Back to creation studio">
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.topTitleWrap}>
            <Text style={styles.eyebrow}>HONOUR YOUR MENTOR</Text>
            <Text style={styles.topTitle}>{screenTitle}</Text>
          </View>
          <Pressable onPress={handleSaveDraft} style={styles.draftButton} accessibilityRole="button" accessibilityLabel="Save draft">
            <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => setIsPreviewVisible(true)}
            style={styles.previewLink}
            accessibilityRole="button"
            accessibilityLabel={`Preview ${isMemo ? "memo" : isLetter ? "letter" : "note"}`}
          >
            <Ionicons name="eye-outline" size={17} color={accent} />
            <Text style={[styles.previewLinkText, { color: accent }]}>
              {`Preview ${isMemo ? "Memo" : isLetter ? "Letter" : "Note"}`}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.introBadge, { borderColor: `${accent}55` }]}>
            <Ionicons name={isMemo ? "book-outline" : isLetter ? "mail-open-outline" : "color-palette-outline"} size={16} color={accent} />
            <Text style={[styles.introText, { color: accent }]}>
              {isMemo ? "A page from your memory journal" : isLetter ? "A letter worth keeping" : "A little piece of personal stationery"}
            </Text>
          </View>
          {prompt ? <Text style={styles.promptText}>“{prompt}”</Text> : null}

          {!isMemo && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{isLetter ? "WRITING TO" : "MENTOR'S NAME"}</Text>
              <TextInput
                style={styles.darkInput}
                placeholder="Their name"
                placeholderTextColor={Palette.textMuted}
                value={mentorName}
                onChangeText={setMentorName}
                autoCapitalize="words"
              />
            </View>
          )}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>YOUR RELATIONSHIP</Text>
            <TextInput
              style={styles.darkInput}
              placeholder="Teacher, parent, coach…"
              placeholderTextColor={Palette.textMuted}
              value={relationship}
              onChangeText={setRelationship}
            />
          </View>

          {isLetter ? (
            <LetterEditor
              title={title}
              body={body}
              mentorName={mentorName}
              greeting={greeting}
              closing={closing}
              signature={signature}
              date={dateOrYear}
              onTitleChange={setTitle}
              onBodyChange={setBody}
              onGreetingChange={setGreeting}
              onClosingChange={setClosing}
              onSignatureChange={setSignature}
              onDateChange={setDateOrYear}
              paperStyle={layoutStyle}
              onPaperChange={setLayoutStyle}
              hasEnvelope={decorations.includes("envelope")}
              onEnvelopeChange={(enabled) => {
                setDecorations((current) =>
                  enabled
                    ? [...current.filter((item) => item !== "envelope"), "envelope"]
                    : current.filter((item) => item !== "envelope")
                );
              }}
              accent={accent}
              paperColor={paperColor}
              paperInk={paperInk}
            />
          ) : isMemo ? (
            <MemoEditor
              title={title}
              body={body}
              mentorName={mentorName}
              quote={quote}
              date={dateOrYear}
              photoUri={photoUri}
              onTitleChange={setTitle}
              onBodyChange={setBody}
              onMentorNameChange={setMentorName}
              onQuoteChange={setQuote}
              onDateChange={setDateOrYear}
              onPickPhoto={handlePickPhoto}
              onRemovePhoto={() => setPhotoUri("")}
            />
          ) : (
            <NoteEditor
              title={title}
              body={body}
              quote={quote}
              photoUri={photoUri}
              layoutStyle={layoutStyle}
              decorations={decorations}
              onTitleChange={setTitle}
              onBodyChange={setBody}
              onQuoteChange={setQuote}
              onPickPhoto={handlePickPhoto}
              onRemovePhoto={() => setPhotoUri("")}
              onLayoutChange={setLayoutStyle}
              onDecorationsChange={setDecorations}
              accent={accent}
            />
          )}

          {/* Dedication & Feed Sharing Section */}
          <View style={styles.dedicationCard}>
            <View style={styles.dedicationHeader}>
              <Ionicons name="mail-outline" size={18} color={Palette.accentMint} />
              <Text style={styles.dedicationTitle}>Dedicate & Share</Text>
            </View>
            <Text style={styles.dedicationSubtitle}>
              Enter your mentor&apos;s email address so we can send them a direct link to view this tribute on the website.
            </Text>

            <TextInput
              style={styles.dedicationInput}
              placeholder="Mentor's Email (e.g. mentor@example.com)"
              placeholderTextColor="#777777"
              value={mentorEmail}
              onChangeText={setMentorEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.dedicationOption}
              onPress={() => setSendDedicationEmail((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={sendDedicationEmail ? "checkbox" : "square-outline"}
                size={20}
                color={sendDedicationEmail ? Palette.accentMint : "#666666"}
              />
              <Text style={styles.dedicationOptionText}>
                Send email notification from info@onodem.com when saved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dedicationOption}
              onPress={() => setIsSharedOnFeed((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSharedOnFeed ? "checkbox" : "square-outline"}
                size={20}
                color={isSharedOnFeed ? Palette.accentSky : "#666666"}
              />
              <Text style={styles.dedicationOptionText}>
                Share this post publicly on Community Feed & Memory Wall
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomGap} />
        </ScrollView>

        <View style={styles.actionBar}>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={17} color="#FFFFFF" />
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]}
          >
            <Text style={styles.saveText}>{isSaving ? "Saving…" : `Save ${isMemo ? "Memo" : isLetter ? "Letter" : "Note"}`}</Text>
            <Ionicons name="arrow-forward" size={17} color="#111111" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <BottomNavigation activeTab="create" />
      <PreviewModal
        visible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        type={type}
        title={title}
        body={body}
        quote={quote}
        mentorName={mentorName}
        date={dateOrYear}
        greeting={greeting}
        closing={closing}
        signature={signature}
        photoUri={photoUri}
        layoutStyle={layoutStyle}
        decorations={decorations}
      />
    </SafeAreaView>
  );
}

interface MemoEditorProps {
  title: string;
  body: string;
  mentorName: string;
  quote: string;
  date: string;
  photoUri: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onMentorNameChange: (value: string) => void;
  onQuoteChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
}

function MemoEditor(props: MemoEditorProps) {
  return (
    <>
      <Text style={styles.sectionHeading}>A moment to remember</Text>
      <View style={styles.memoPaper}>
        <View style={styles.memoMargin} />
        <TextInput
          style={styles.paperTitle}
          value={props.title}
          onChangeText={props.onTitleChange}
          placeholder="Give this memory a name"
          placeholderTextColor="#9B8C78"
        />
        <TextInput
          style={styles.paperMentor}
          value={props.mentorName}
          onChangeText={props.onMentorNameChange}
          placeholder="For someone who helped you grow"
          placeholderTextColor="#9B8C78"
          autoCapitalize="words"
        />
        <View style={styles.paperDateRow}>
          <Ionicons name="calendar-outline" size={13} color="#9B8061" />
          <TextInput
            style={styles.paperDate}
            value={props.date}
            onChangeText={props.onDateChange}
            placeholder="When did it happen?"
            placeholderTextColor="#9B8C78"
          />
        </View>
        <TextInput
          style={styles.paperBody}
          value={props.body}
          onChangeText={props.onBodyChange}
          placeholder="Where were you? What did they say? Capture the little details you never want to forget…"
          placeholderTextColor="#9B8C78"
          multiline
          textAlignVertical="top"
        />
        <View style={styles.paperFooter}>
          <Text style={styles.paperMeta}>A MEMORY, PRESERVED</Text>
          <Ionicons name="sparkles-outline" size={15} color="#B18756" />
        </View>
      </View>
      <QuoteField value={props.quote} onChangeText={props.onQuoteChange} label="WORDS YOU WANT TO KEEP" />
      <PhotoAttachment uri={props.photoUri} onPick={props.onPickPhoto} onRemove={props.onRemovePhoto} />
    </>
  );
}

interface NoteEditorProps {
  title: string;
  body: string;
  quote: string;
  photoUri: string;
  layoutStyle: string;
  decorations: string[];
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onQuoteChange: (value: string) => void;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
  onLayoutChange: (value: string) => void;
  onDecorationsChange: (value: string[]) => void;
  accent: string;
}

function NoteEditor(props: NoteEditorProps) {
  const addDecoration = (decoration: string) => {
    props.onDecorationsChange(
      props.decorations.includes(decoration)
        ? props.decorations.filter((item) => item !== decoration)
        : [...props.decorations, decoration]
    );
  };
  return (
    <>
      <Text style={styles.sectionHeading}>Choose your stationery</Text>
      <View style={styles.choiceRow}>
        {NOTE_LAYOUTS.map((layout) => (
          <Pressable
            key={layout.id}
            onPress={() => props.onLayoutChange(layout.id)}
            style={[styles.choice, props.layoutStyle === layout.id && styles.choiceActive]}
          >
            <Ionicons name={layout.icon} size={16} color={props.layoutStyle === layout.id ? props.accent : Palette.textSecondary} />
            <Text style={[styles.choiceText, props.layoutStyle === layout.id && { color: props.accent }]}>{layout.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.notePaper, props.layoutStyle === "postcard" && styles.postcardPaper, props.layoutStyle === "minimal" && styles.minimalPaper]}>
        <View style={styles.noteOrnament}>
          <Text style={[styles.ornamentText, { color: props.accent }]}>{props.layoutStyle === "botanical" ? "❧  ✿  ❧" : props.layoutStyle === "postcard" ? "POST • CARD" : "✦"}</Text>
        </View>
        <TextInput
          style={styles.noteTitle}
          value={props.title}
          onChangeText={props.onTitleChange}
          placeholder="A thoughtful little note"
          placeholderTextColor="#9B8C78"
          textAlign="center"
        />
        <View style={[styles.noteDivider, { backgroundColor: props.accent }]} />
        <TextInput
          style={styles.noteBody}
          value={props.body}
          onChangeText={props.onBodyChange}
          placeholder="Write something only you could say…"
          placeholderTextColor="#9B8C78"
          multiline
          textAlignVertical="top"
        />
        {props.decorations.length > 0 ? <Text style={[styles.stickerPreview, { color: props.accent }]}>{props.decorations.join("  ")}</Text> : null}
      </View>
      <Text style={styles.fieldLabel}>ADD A LITTLE DETAIL</Text>
      <View style={styles.choiceRow}>
        {NOTE_STICKERS.map((sticker) => (
          <Pressable key={sticker} onPress={() => addDecoration(sticker)} style={[styles.sticker, props.decorations.includes(sticker) && { backgroundColor: `${props.accent}25`, borderColor: props.accent }]}>
            <Text style={[styles.stickerText, props.decorations.includes(sticker) && { color: props.accent }]}>{sticker}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => addDecoration("— ✦ —")}
          style={[styles.dividerPreview, props.decorations.includes("— ✦ —") && { borderColor: props.accent }]}
          accessibilityRole="button"
          accessibilityLabel="Add or remove decorative divider"
        >
          <View style={[styles.noteDivider, { backgroundColor: props.accent }]} />
        </Pressable>
      </View>
      <QuoteField value={props.quote} onChangeText={props.onQuoteChange} label="A QUOTE OR SIGN-OFF (OPTIONAL)" />
      <PhotoAttachment uri={props.photoUri} onPick={props.onPickPhoto} onRemove={props.onRemovePhoto} />
    </>
  );
}

interface LetterEditorProps {
  title: string;
  body: string;
  mentorName: string;
  greeting: string;
  closing: string;
  signature: string;
  date: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onGreetingChange: (value: string) => void;
  onClosingChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  onDateChange: (value: string) => void;
  paperStyle: string;
  onPaperChange: (value: string) => void;
  hasEnvelope: boolean;
  onEnvelopeChange: (enabled: boolean) => void;
  accent: string;
  paperColor: string;
  paperInk: string;
}

function LetterEditor(props: LetterEditorProps) {
  return (
    <>
      <Text style={styles.sectionHeading}>Set the tone of your letter</Text>
      <View style={styles.choiceRow}>
        {LETTER_PAPERS.map((paper) => (
          <Pressable key={paper.id} onPress={() => props.onPaperChange(paper.id)} style={[styles.paperChoice, { backgroundColor: paper.color }, props.paperStyle === paper.id && styles.paperChoiceActive]}>
            <Text style={[styles.paperChoiceText, { color: paper.ink }]}>{paper.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => props.onEnvelopeChange(!props.hasEnvelope)}
        style={[styles.envelopeToggle, props.hasEnvelope && styles.envelopeToggleActive]}
        accessibilityRole="button"
        accessibilityState={{ selected: props.hasEnvelope }}
      >
        <Ionicons
          name={props.hasEnvelope ? "mail" : "mail-outline"}
          size={17}
          color={props.hasEnvelope ? props.accent : Palette.textSecondary}
        />
        <Text style={[styles.envelopeToggleText, props.hasEnvelope && { color: props.accent }]}>
          {props.hasEnvelope ? "Envelope added" : "Add a keepsake envelope"}
        </Text>
        <Ionicons
          name={props.hasEnvelope ? "checkmark-circle" : "add-circle-outline"}
          size={17}
          color={props.hasEnvelope ? props.accent : Palette.textSecondary}
        />
      </Pressable>
      <View style={[styles.letterPaper, { backgroundColor: props.paperColor, borderColor: `${props.accent}55` }]}>
        <View style={[styles.letterTopRule, { backgroundColor: props.accent }]} />
        <Text style={[styles.letterOrnament, { color: props.accent }]}>❦</Text>
        <TextInput
          style={[styles.letterGreeting, { color: props.paperInk }]}
          value={props.greeting}
          onChangeText={props.onGreetingChange}
          placeholder={`Dear ${props.mentorName || "someone special"}…`}
          placeholderTextColor="#9B8C78"
        />
        <TextInput
          style={[styles.letterSubject, { color: props.paperInk }]}
          value={props.title}
          onChangeText={props.onTitleChange}
          placeholder="A few words from my heart"
          placeholderTextColor="#9B8C78"
        />
        <TextInput
          style={[styles.letterBody, { color: props.paperInk }]}
          value={props.body}
          onChangeText={props.onBodyChange}
          placeholder="I have wanted to tell you…"
          placeholderTextColor="#9B8C78"
          multiline
          textAlignVertical="top"
        />
        <TextInput
          style={[styles.letterClosing, { color: props.paperInk }]}
          value={props.closing}
          onChangeText={props.onClosingChange}
          placeholder="With gratitude,"
          placeholderTextColor="#9B8C78"
        />
        <TextInput
          style={[styles.letterSignature, { color: props.paperInk }]}
          value={props.signature}
          onChangeText={props.onSignatureChange}
          placeholder="Your name"
          placeholderTextColor="#9B8C78"
        />
        <TextInput
          style={[styles.letterDate, { color: props.paperInk }]}
          value={props.date}
          onChangeText={props.onDateChange}
          placeholder="Date (optional)"
          placeholderTextColor="#9B8C78"
        />
      </View>
      {props.hasEnvelope ? (
        <View style={styles.envelopePreview}>
          <Ionicons name="mail-open-outline" size={18} color={props.accent} />
          <Text style={styles.envelopePreviewText}>SEALED WITH GRATITUDE</Text>
          <Text style={styles.envelopeRecipient}>{props.greeting.replace(/^Dear\s*/i, "").replace(/[,!]+$/, "") || "To someone special"}</Text>
        </View>
      ) : null}
    </>
  );
}

function QuoteField({ value, onChangeText, label }: { value: string; onChangeText: (value: string) => void; label: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.darkInput, styles.quoteInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder="“The words that stayed with me…”"
        placeholderTextColor={Palette.textMuted}
        multiline
      />
    </View>
  );
}

function PhotoAttachment({ uri, onPick, onRemove }: { uri: string; onPick: () => void; onRemove: () => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>A PHOTO TO KEEP (OPTIONAL)</Text>
      {uri ? (
        <View style={styles.photoCard}>
          <Image source={{ uri }} style={styles.attachmentImage} />
          <Pressable onPress={onRemove} style={styles.removePhoto}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onPick} style={styles.photoButton}>
          <Ionicons name="image-outline" size={19} color={Palette.accentSky} />
          <Text style={styles.photoButtonText}>Attach a photograph</Text>
          <Ionicons name="add-circle-outline" size={18} color={Palette.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

interface PreviewModalProps {
  visible: boolean;
  onClose: () => void;
  type: StudioType;
  title: string;
  body: string;
  quote: string;
  mentorName: string;
  date: string;
  greeting: string;
  closing: string;
  signature: string;
  photoUri: string;
  layoutStyle: string;
  decorations: string[];
}

function PreviewModal(props: PreviewModalProps) {
  const isLetter = props.type === "letter";
  const isMemo = props.type === "memory";
  const paper = isLetter ? LETTER_PAPERS.find((item) => item.id === props.layoutStyle) ?? LETTER_PAPERS[0] : LETTER_PAPERS[0];
  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      <View style={styles.previewBackdrop}>
        <SafeAreaView style={styles.previewSafe}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewHeading}>A little preview</Text>
            <Pressable onPress={props.onClose} style={styles.iconButton}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.previewContent}>
            <View style={[
              styles.previewPaper,
              props.type === "lesson" && props.layoutStyle === "postcard" && styles.postcardPaper,
              props.type === "lesson" && props.layoutStyle === "minimal" && styles.minimalPaper,
              { backgroundColor: props.type === "lesson" && props.layoutStyle === "postcard" ? "#F4E8DE" : paper.color },
            ]}>
              {isLetter ? (
                <>
                  <Text style={styles.previewLetterOrnament}>❦</Text>
                  <Text style={styles.previewLetterGreeting}>{props.greeting || `Dear ${props.mentorName},`}</Text>
                  {props.title ? <Text style={styles.previewLetterTitle}>{props.title}</Text> : null}
                  <Text style={styles.previewLetterBody}>{props.body || "Your words will appear here…"}</Text>
                  <Text style={styles.previewLetterClosing}>{props.closing}</Text>
                  <Text style={styles.previewSignature}>{props.signature}</Text>
                  {props.date ? <Text style={styles.previewDate}>{props.date}</Text> : null}
                  {props.decorations.includes("envelope") ? (
                    <View style={styles.previewEnvelope}>
                      <Ionicons name="mail-open-outline" size={17} color="#A66D55" />
                      <Text style={styles.previewEnvelopeText}>SEALED WITH GRATITUDE</Text>
                      <Text style={styles.previewEnvelopeRecipient}>For {props.mentorName || "someone special"}</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.previewKicker}>{isMemo ? "A MOMENT TO KEEP" : "A NOTE FOR SOMEONE SPECIAL"}</Text>
                  <Text style={styles.previewPaperTitle}>{props.title || (isMemo ? "A Moment Cherished" : "A Thought for You")}</Text>
                  {!isMemo ? <Text style={styles.previewDivider}>✦  ─────  ✦</Text> : null}
                  <Text style={styles.previewPaperBody}>{props.body || "Your writing will appear here…"}</Text>
                  {props.photoUri ? <Image source={{ uri: props.photoUri }} style={styles.previewPhoto} /> : null}
                  {props.quote ? <Text style={styles.previewQuote}>“{props.quote}”</Text> : null}
                  {props.decorations.length > 0 ? <Text style={styles.previewDecoration}>{props.decorations.join("  ")}</Text> : null}
                  <Text style={styles.previewMentor}>For {props.mentorName || "someone who matters"}</Text>
                  {props.date ? <Text style={styles.previewDate}>{props.date}</Text> : null}
                </>
              )}
            </View>
          </ScrollView>
          <Pressable onPress={props.onClose} style={styles.previewDone}>
            <Text style={styles.previewDoneText}>Back to editing</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000000" },
  flex: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#171717", alignItems: "center", justifyContent: "center" },
  topTitleWrap: { flex: 1 },
  draftButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#171717" },
  eyebrow: { color: Palette.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  topTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 2 },
  previewLink: { flexDirection: "row", alignItems: "center", gap: 5, padding: 8 },
  previewLinkText: { fontSize: 12, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  introBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#151515", marginBottom: 14 },
  introText: { fontSize: 11, fontWeight: "700" },
  promptText: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19, fontStyle: "italic", marginBottom: 14 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: Palette.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  darkInput: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: "#303030", backgroundColor: "#171717", paddingHorizontal: 14, paddingVertical: 12, color: "#FFFFFF", fontSize: 14 },
  sectionHeading: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 6, marginBottom: 10 },
  memoPaper: { backgroundColor: "#F6EFDF", borderRadius: 5, minHeight: 230, paddingHorizontal: 23, paddingTop: 20, paddingBottom: 14, marginBottom: 18, overflow: "hidden", borderWidth: 1, borderColor: "#D6C7AB", position: "relative", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  memoMargin: { position: "absolute", left: 42, top: 0, bottom: 0, width: 1, backgroundColor: "#D8A5A1" },
  paperTitle: { color: "#3C342E", fontFamily: AppFonts.body, fontSize: 20, fontWeight: "700", paddingLeft: 34, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#DDCFB8" },
  paperMentor: { color: "#6E5B49", fontFamily: AppFonts.body, fontSize: 12, paddingLeft: 34, paddingTop: 8 },
  paperDateRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 34, marginTop: 4, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#E7DCC8" },
  paperDate: { flex: 1, color: "#806E5C", fontFamily: AppFonts.body, fontSize: 11, paddingVertical: 5 },
  paperBody: { color: "#51483E", fontFamily: AppFonts.body, fontSize: 15, lineHeight: 26, minHeight: 142, paddingLeft: 34, paddingTop: 11, textAlignVertical: "top" },
  paperFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 34, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#DDCFB8" },
  paperMeta: { color: "#9B8061", fontSize: 8, fontWeight: "800", letterSpacing: 1.1 },
  quoteInput: { minHeight: 72, fontStyle: "italic" },
  choiceRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 14 },
  choice: { flex: 1, minHeight: 43, backgroundColor: "#171717", borderRadius: 13, borderWidth: 1, borderColor: "#303030", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  choiceActive: { borderColor: Palette.accentLavender, backgroundColor: "#202020" },
  choiceText: { color: Palette.textSecondary, fontSize: 11, fontWeight: "700" },
  notePaper: { backgroundColor: "#F6EFDF", borderRadius: 8, minHeight: 250, padding: 22, marginBottom: 18, borderWidth: 1, borderColor: "#D6C7AB", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 12, elevation: 4 },
  postcardPaper: { borderRadius: 3, borderStyle: "dashed", borderWidth: 1.5 },
  minimalPaper: { borderRadius: 2, borderWidth: 0, borderBottomWidth: 3, borderBottomColor: "#D4C7B4" },
  noteOrnament: { marginBottom: 5 },
  ornamentText: { fontSize: 16, letterSpacing: 2 },
  noteTitle: { width: "100%", color: "#3C342E", fontFamily: AppFonts.body, fontSize: 21, fontWeight: "700", paddingVertical: 8 },
  noteDivider: { width: 60, height: 1, marginVertical: 8, opacity: 0.72 },
  noteBody: { width: "100%", color: "#51483E", fontFamily: AppFonts.body, fontSize: 15, lineHeight: 24, minHeight: 125, textAlign: "left", paddingTop: 8 },
  stickerPreview: { alignSelf: "flex-end", fontSize: 17, marginTop: 8 },
  sticker: { width: 42, height: 42, backgroundColor: "#171717", borderRadius: 13, borderWidth: 1, borderColor: "#303030", alignItems: "center", justifyContent: "center" },
  stickerText: { color: Palette.textSecondary, fontSize: 20 },
  dividerPreview: { flex: 1, height: 42, backgroundColor: "#171717", borderRadius: 13, borderWidth: 1, borderColor: "#303030", alignItems: "center", justifyContent: "center" },
  paperChoice: { flex: 1, minHeight: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  paperChoiceActive: { borderColor: Palette.accentPink, borderWidth: 2 },
  paperChoiceText: { fontSize: 12, fontWeight: "700" },
  letterPaper: { padding: 22, paddingTop: 25, borderWidth: 1, borderRadius: 3, minHeight: 460, marginBottom: 18, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, elevation: 4, overflow: "hidden" },
  envelopeToggle: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#171717", borderRadius: 13, borderWidth: 1, borderColor: "#303030", paddingHorizontal: 13, paddingVertical: 11, marginBottom: 14 },
  envelopeToggleActive: { borderColor: Palette.accentPink, backgroundColor: "#20191D" },
  envelopeToggleText: { flex: 1, color: Palette.textSecondary, fontSize: 12, fontWeight: "700" },
  envelopePreview: { minHeight: 90, borderRadius: 4, borderWidth: 1, borderColor: "#D6C7AB", backgroundColor: "#F6EFDF", alignItems: "center", justifyContent: "center", gap: 5, marginTop: -4, marginBottom: 18 },
  envelopePreviewText: { color: "#9B8061", fontSize: 8, fontWeight: "800", letterSpacing: 1.2 },
  envelopeRecipient: { color: "#40342A", fontFamily: AppFonts.handwritten, fontSize: 21 },
  letterTopRule: { height: 2, width: 42, marginBottom: 12, opacity: 0.8 },
  letterOrnament: { fontFamily: AppFonts.handwritten, fontSize: 27, textAlign: "center", marginBottom: 8 },
  letterGreeting: { fontFamily: AppFonts.handwritten, fontSize: 28, marginBottom: 12, minHeight: 40 },
  letterSubject: { color: "#40342A", fontFamily: AppFonts.handwritten, fontSize: 24, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(70,50,35,0.12)", marginBottom: 10 },
  letterBody: { fontFamily: AppFonts.handwritten, fontSize: 22, lineHeight: 31, minHeight: 230, textAlignVertical: "top", paddingTop: 4 },
  letterClosing: { fontFamily: AppFonts.handwritten, fontSize: 23, marginTop: 12, minHeight: 32 },
  letterSignature: { fontFamily: AppFonts.handwritten, fontSize: 32, minHeight: 44, marginTop: 3 },
  letterDate: { fontSize: 11, textAlign: "right", marginTop: 10, minHeight: 20, opacity: 0.7 },
  photoCard: { height: 170, borderRadius: 14, overflow: "hidden", position: "relative", backgroundColor: "#171717" },
  attachmentImage: { width: "100%", height: "100%" },
  removePhoto: { position: "absolute", right: 9, top: 9, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" },
  photoButton: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, backgroundColor: "#171717", borderRadius: 14, borderWidth: 1, borderColor: "#303030" },
  photoButtonText: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginLeft: 10 },
  dedicationCard: { backgroundColor: "#151515", borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: "#272727" },
  dedicationHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  dedicationTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  dedicationSubtitle: { color: "#9E9E9E", fontSize: 12, lineHeight: 18, marginBottom: 14 },
  dedicationInput: { backgroundColor: "#1F1F1F", borderRadius: 12, borderWidth: 1, borderColor: "#333333", color: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, marginBottom: 14 },
  dedicationOption: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  dedicationOptionText: { color: "#DDDDDD", fontSize: 13, flex: 1, lineHeight: 18 },
  bottomGap: { height: 30 },
  actionBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 92, backgroundColor: "#000000", borderTopWidth: 1, borderTopColor: "#1E1E1E" },
  shareButton: { height: 50, minWidth: 106, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, borderWidth: 1, borderColor: "#383838", backgroundColor: "#171717" },
  shareText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  saveButton: { flex: 1, height: 50, paddingHorizontal: 18, backgroundColor: "#FFFFFF", borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  saveText: { color: "#111111", fontSize: 14, fontWeight: "800" },
  invalidWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  invalidText: { color: "#FFFFFF", fontSize: 16, marginBottom: 16 },
  backButton: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: "#FFFFFF" },
  backButtonText: { color: "#111111", fontWeight: "800" },
  previewBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.94)" },
  previewSafe: { flex: 1 },
  previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  previewHeading: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  previewContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  previewPaper: { padding: 25, borderRadius: 4, minHeight: 340, borderWidth: 1, borderColor: "#D6C7AB" },
  previewLetterOrnament: { color: "#A66D55", fontFamily: AppFonts.handwritten, fontSize: 30, textAlign: "center", marginBottom: 8 },
  previewLetterGreeting: { color: "#392C24", fontFamily: AppFonts.handwritten, fontSize: 29, marginBottom: 10 },
  previewLetterTitle: { color: "#392C24", fontFamily: AppFonts.handwritten, fontSize: 24, marginBottom: 8 },
  previewLetterBody: { color: "#392C24", fontFamily: AppFonts.handwritten, fontSize: 22, lineHeight: 32, marginBottom: 18 },
  previewLetterClosing: { color: "#392C24", fontFamily: AppFonts.handwritten, fontSize: 23 },
  previewSignature: { color: "#392C24", fontFamily: AppFonts.handwritten, fontSize: 32, marginTop: 4 },
  previewKicker: { color: "#9B8061", textAlign: "center", fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  previewPaperTitle: { color: "#3C342E", textAlign: "center", fontFamily: AppFonts.body, fontSize: 22, fontWeight: "700", marginTop: 12, marginBottom: 8 },
  previewDivider: { color: "#B18756", textAlign: "center", marginVertical: 10 },
  previewPaperBody: { color: "#51483E", fontFamily: AppFonts.body, fontSize: 15, lineHeight: 24, marginTop: 12 },
  previewPhoto: { width: "100%", height: 150, borderRadius: 5, marginTop: 14 },
  previewQuote: { color: "#6C5944", fontFamily: AppFonts.body, fontStyle: "italic", fontSize: 15, textAlign: "center", marginTop: 14 },
  previewDecoration: { color: Palette.accentLavender, textAlign: "right", fontSize: 18, marginTop: 12 },
  previewMentor: { color: "#8C755C", textAlign: "center", fontSize: 11, fontWeight: "700", marginTop: 18 },
  previewDate: { color: "#8C755C", textAlign: "right", fontSize: 10, marginTop: 10 },
  previewEnvelope: { alignItems: "center", justifyContent: "center", gap: 5, minHeight: 76, marginTop: 18, borderWidth: 1, borderColor: "#D6C7AB", backgroundColor: "#F6EFDF" },
  previewEnvelopeText: { color: "#9B8061", fontSize: 8, fontWeight: "800", letterSpacing: 1.2 },
  previewEnvelopeRecipient: { color: "#40342A", fontFamily: AppFonts.body, fontStyle: "italic", fontSize: 13 },
  previewDone: { backgroundColor: "#FFFFFF", borderRadius: 15, height: 48, alignItems: "center", justifyContent: "center", marginHorizontal: 20, marginBottom: 14 },
  previewDoneText: { color: "#111111", fontSize: 14, fontWeight: "800" },
});
