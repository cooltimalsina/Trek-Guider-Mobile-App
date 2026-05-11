import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { MobileBooking } from "@/types/booking";
import { countByLifecycle, type TripLifecycleFilter } from "@/utils/bookingFilters";
import { colors } from "@/theme/colors";

const ORDER: TripLifecycleFilter[] = ["all", "pending", "accepted", "declined", "cancelled"];

const LABELS: Record<TripLifecycleFilter, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

type Props = {
  list: MobileBooking[];
  selected: TripLifecycleFilter;
  onSelect: (tab: TripLifecycleFilter) => void;
};

export function TripLifecycleChips({ list, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ORDER.map((tab) => {
        const count =
          tab === "all"
            ? list.length
            : countByLifecycle(list, tab);
        const on = selected === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelect(tab)}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>
              {LABELS[tab]}
              <Text style={[styles.chipCount, on && styles.chipCountOn]}> {count}</Text>
            </Text>
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
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  chipLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
  chipLabelOn: { color: "#FFFFFF" },
  chipCount: { fontSize: 14, fontWeight: "400", color: colors.muted },
  chipCountOn: { color: "rgba(255,255,255,0.75)" },
});
