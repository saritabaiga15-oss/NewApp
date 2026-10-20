import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface AddMemoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

interface MemoryActionOption {
  key: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const OPTIONS: MemoryActionOption[] = [
  {
    key: "photo",
    label: "Photo Memory",
    description: "Capture a milestone, handwritten note, or portrait",
    icon: "camera",
    color: Palette.oceanTeal,
    bg: Palette.mintMist,
  },
  {
    key: "message",
    label: "Gratitude Message",
    description: "Express what their guidance meant to your journey",
    icon: "chatbubble-ellipses",
    color: Palette.turquoise,
    bg: "rgba(236, 143, 62, 0.18)",
  },
  {
    key: "voice",
    label: "Record Voice Note",
    description: "Speak directly from the heart with an audio keepsake",
    icon: "mic",
    color: Palette.oceanTeal,
    bg: Palette.mintMist,
  },
  {
    key: "achievement",
    label: "Milestone & Award",
    description: "Dedicate a graduation, promotion, or personal victory",
    icon: "trophy",
    color: Palette.turquoise,
    bg: "rgba(236, 143, 62, 0.18)",
  },
  {
    key: "story",
    label: "Life Lesson / Reflection",
    description: "Chronicle a philosophy or turning point they inspired",
    icon: "book",
    color: Palette.oceanTeal,
    bg: Palette.mintMist,
  },
];

export default function AddMemoryModal({
  visible,
  onClose,
  onSelectOption,
}: AddMemoryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.sheetSurface}>
                {/* Drag Handle */}
                <View style={styles.dragHandle} />

                {/* Header */}
                <View style={styles.header}>
                  <View>
                    <Text style={styles.sheetTitle}>Add a Living Memory</Text>
                    <Text style={styles.sheetSubtitle}>
                      Celebrate someone who shaped your soul
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={20} color={Palette.deepTeal} />
                  </TouchableOpacity>
                </View>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.8}
                      onPress={() => {
                        onSelectOption(opt.key);
                        onClose();
                      }}
                      style={styles.optionRow}
                    >
                      <View
                        style={[
                          styles.optionIconWrap,
                          { backgroundColor: opt.bg },
                        ]}
                      >
                        <Ionicons name={opt.icon} size={22} color={opt.color} />
                      </View>
                      <View style={styles.optionTextWrap}>
                        <Text style={styles.optionLabel}>{opt.label}</Text>
                        <Text style={styles.optionDescription}>
                          {opt.description}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={Palette.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(21, 59, 70, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    backgroundColor: Palette.iceWhite, // Ice White sheet
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  sheetSurface: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(84, 0, 14, 0.25)",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Palette.deepTeal, // Deep Teal heading
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(84, 0, 14, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsList: {
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.pureWhite, // Pure White card
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  optionDescription: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});
