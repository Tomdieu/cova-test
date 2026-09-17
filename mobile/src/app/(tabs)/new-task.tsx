import { useState, useCallback } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { tasks as tasksApi } from "@/api/client";
import type { TaskStatus, CreateTaskPayload } from "@/types";
import { Button } from "@/components/ui/button";
import Toast from "react-native-toast-message";
import { CircleDot, Clock, CheckCircle2 } from "lucide-react-native";

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: typeof CircleDot }[] = [
  { value: "TODO", label: "To do", icon: CircleDot },
  { value: "IN_PROGRESS", label: "In progress", icon: Clock },
  { value: "DONE", label: "Done", icon: CheckCircle2 },
];

export default function NewTaskTab() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setTitleError(undefined);
    }, []),
  );

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
      await tasksApi.create(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Task created" });
      setTitle("");
      setDescription("");
      setStatus("TODO");
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

  return (
    <View
      className="flex-1 bg-neutral-50"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
    >
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-2xl font-bold text-neutral-900">New task</Text>
        <Text className="text-sm text-neutral-500 mt-1">What needs to be done?</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
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

      {/* Submit */}
      <View className="px-5 pb-2">
        <Button
          onPress={handleSubmit}
          loading={loading}
          disabled={!title.trim()}
          size="lg"
          className="w-full"
        >
          Create task
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
