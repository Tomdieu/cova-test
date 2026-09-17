import { View, Text, Pressable, StyleSheet } from "react-native";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";
import { MoreVertical } from "lucide-react-native";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onLongPress?: (task: Task, y: number) => void;
}

const STATUS_DOT: Record<string, string> = {
  TODO: "#a3a3a3",
  IN_PROGRESS: "#2563eb",
  DONE: "#16a34a",
};

export function TaskCard({ task, onEdit, onDelete, onLongPress }: TaskCardProps) {
  const isDone = task.status === "DONE";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Status dot */}
        <View style={[styles.dot, { backgroundColor: STATUS_DOT[task.status] }]} />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, isDone && styles.titleDone]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <Badge status={task.status} />
          </View>
          {task.description ? (
            <Text style={styles.desc} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}
          <Text style={styles.date}>
            {new Date(task.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Menu */}
        <Pressable
          onPress={(e) => {
            const y = e.nativeEvent.pageY;
            onLongPress?.(task, y);
          }}
          hitSlop={8}
          style={styles.menuBtn}
        >
          <MoreVertical size={16} color="#a3a3a3" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#171717",
    flex: 1,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: "#a3a3a3",
  },
  desc: {
    fontSize: 13,
    color: "#737373",
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: "#a3a3a3",
    marginTop: 2,
  },
  menuBtn: {
    padding: 4,
    marginTop: 2,
  },
});
