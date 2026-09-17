import { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus, CreateTaskPayload } from "@/types";

interface TaskDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskPayload) => Promise<void>;
  task?: Task | null;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

export function TaskDialog({ visible, onClose, onSave, task }: TaskDialogProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {visible && (
        <TaskDialogForm task={task} onSave={onSave} onClose={onClose} />
      )}
    </Modal>
  );
}

function TaskDialogForm({
  task,
  onSave,
  onClose,
}: {
  task: Task | null | undefined;
  onSave: (data: CreateTaskPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState<string | undefined>();

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError("Title is required");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setTitleError(undefined);
    setLoading(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), status });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-200">
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
          }}
        >
          <Text className="text-base text-neutral-500">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold">{task ? "Edit task" : "New task"}</Text>
        <View className="w-16" />
      </View>

      <ScrollView className="flex-1 p-4 gap-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError) setTitleError(undefined);
          }}
          error={titleError}
          required
        />
        <Input
          label="Description"
          placeholder="Add more details (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View className="gap-2">
          <Text className="text-sm font-medium text-neutral-700">Status</Text>
          <View className="flex-row gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setStatus(opt.value);
                }}
                className="flex-1 py-2.5 rounded-xl"
                style={status === opt.value ? styles.statusActive : styles.statusInactive}
              >
                <Text
                  className="text-sm font-medium text-center"
                  style={status === opt.value ? styles.statusTextActive : styles.statusTextInactive}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-neutral-200">
        <Button onPress={handleSubmit} loading={loading} disabled={!title.trim()}>
          {task ? "Save changes" : "Create task"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusActive: { backgroundColor: "#171717", borderWidth: 1, borderColor: "#171717" },
  statusInactive: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d4d4d8" },
  statusTextActive: { color: "#ffffff" },
  statusTextInactive: { color: "#3f3f46" },
});
