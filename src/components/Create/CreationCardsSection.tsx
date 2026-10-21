import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Palette } from "@/constants/theme";
import { CreationOptionItem, CreationType } from "@/types/create";
import CreationStudioCard from "./CreationStudioCard";

interface CreationCardsSectionProps {
  options: CreationOptionItem[];
  selectedType?: CreationType;
  onSelectOption: (type: CreationType) => void;
}

export default function CreationCardsSection({
  options,
  selectedType,
  onSelectOption,
}: CreationCardsSectionProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>What Would You Like to Create?</Text>
          <Text style={styles.sectionSubtitle}>
            Choose a canvas to capture someone meaningful
          </Text>
        </View>
      </View>

      {/* Two-column Studio Card Grid */}
      <View style={styles.gridContainer}>
        {options.map((item) => (
          <CreationStudioCard
            key={item.id}
            item={item}
            isSelected={selectedType === item.id}
            onPress={() => onSelectOption(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  headerRow: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
