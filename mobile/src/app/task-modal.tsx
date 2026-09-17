import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tasks as tasksApi } from "@/api/client";
import type { Task, TaskStatus, CreateTaskPayload } from "@/types";
import Toast from "react-native-toast-message";
import { CircleDot, Clock, CheckCircle2 } from "lucide-react-native";

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: typeof CircleDot }[] = [
  { value: "TODO", label: "To do", icon: CircleDot },
  { value: "IN_PROGRESS", label: "In progress", icon: Clock },
  { value: "DONE", label: "Done", icon: CheckCircle2 },
];

function parseInitialTask(taskData?: string): { title: string; description: string; status: TaskStatus } {
  if (!taskData) return { title: "", description: "", status: "TODO" };
  try {
    const task: Task = JSON.parse(taskData);
    return { title: task.title, description: task.description, status: task.status };
  } catch {
    return { title: "", description: "", status: "TODO" };
  }
}

export default function TaskModal() {
  const insets = useSafeAreaInsets();
  const { id, taskData } = useLocalSearchParams<{ id?: string; taskData?: string }>();

  const initial = parseInitialTask(taskData);
  const isEditing = !!id;

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState<TaskStatus>(initial.status);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id && !taskData);
  const [titleError, setTitleError] = useState<string | undefined>();

  useEffect(() => {
    if (id && !taskData) {
      tasksApi
        .list()
        .then((tasks) => {
          const task = tasks.find((t) => t.id === Number(id));
          if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setStatus(task.status);
          }
        })
        .finally(() => setFetching(false));
    }
  }, [id, taskData]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError("Title is required");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setTitleError(undefined);
    setLoading(true);
    try {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim(),
        status,
      };
      if (isEditing) {
        await tasksApi.update(Number(id), payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Task updated" });
      } else {
        await tasksApi.create(payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Task created" });
      }
      router.back();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
        }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#737373" />
          <Text style={styles.loadingText}>Loading task...</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          hitSlop={8}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          {isEditing ? "Edit task" : "New task"}
        </Text>

        <Pressable
          onPress={handleSubmit}
          disabled={loading || !title.trim()}
          hitSlop={8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#171717" />
          ) : (
            <Text style={[styles.saveText, (!title.trim() || loading) && styles.saveDisabled]}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
      >
        {/* Title */}
        <View style={styles.group}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Buy groceries"
              placeholderTextColor="#a3a3a3"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError(undefined);
              }}
              returnKeyType="next"
            />
          </View>
          {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
        </View>

        {/* Description */}
        <View style={styles.group}>
          <Text style={styles.label}>Description</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.descInput}
              placeholder="Add details (optional)"
              placeholderTextColor="#a3a3a3"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.group}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusGroup}>
            {STATUS_OPTIONS.map((opt) => {
              const active = status === opt.value;
              const Icon = opt.icon;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setStatus(opt.value);
                  }}
                  style={[styles.statusOption, active && styles.statusOptionActive]}
                >
                  <Icon size={16} color={active ? "#ffffff" : "#737373"} />
                  <Text style={[styles.statusText, active && styles.statusTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  cancelText: {
    fontSize: 15,
    color: "#737373",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#171717",
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
  },
  saveDisabled: {
    color: "#a3a3a3",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#737373",
  },
  group: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#525252",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputRow: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  titleInput: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#171717",
  },
  descInput: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#171717",
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 6,
    marginLeft: 2,
  },
  statusGroup: {
    flexDirection: "row",
    gap: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  statusOptionActive: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#525252",
  },
  statusTextActive: {
    color: "#ffffff",
  },
});
