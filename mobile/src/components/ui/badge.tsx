import { View, Text } from "react-native";
import type { TaskStatus } from "@/types";

interface BadgeProps {
  status: TaskStatus;
}

const CONFIG: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  TODO: { label: "To do", bg: "#f5f5f5", text: "#525252", dot: "#a3a3a3" },
  IN_PROGRESS: { label: "In progress", bg: "#eff6ff", text: "#2563eb", dot: "#2563eb" },
  DONE: { label: "Done", bg: "#f0fdf4", text: "#16a34a", dot: "#16a34a" },
};

export function Badge({ status }: BadgeProps) {
  const config = CONFIG[status];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: config.bg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.dot,
        }}
      />
      <Text style={{ fontSize: 11, fontWeight: "600", color: config.text }}>
        {config.label}
      </Text>
    </View>
  );
}
