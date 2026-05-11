import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

const ORDER = ["All", "Easy", "Moderate", "Hard"] as const;

export type DifficultyFilter = (typeof ORDER)[number];

type Props = {
  selected: DifficultyFilter;
  onSelect: (d: DifficultyFilter) => void;
};

export function DifficultyFilterChips({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {ORDER.map((d) => {
        const on = selected === d;
        return (
          <Pressable key={d} onPress={() => onSelect(d)} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{d}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingVertical: 4, paddingBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipLabel: { fontSize: 14, fontWeight: "700", color: colors.muted },
  chipLabelOn: { color: colors.primary },
});
