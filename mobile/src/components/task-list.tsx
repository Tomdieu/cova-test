import { useState, useCallback } from "react";
import { View, Text, TextInput, FlatList, RefreshControl, Pressable, Modal, StyleSheet } from "react-native";
import { Search, Plus, Inbox, Pencil, Trash2, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { tasks as tasksApi } from "@/api/client";
import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "@/components/task-card";
import Toast from "react-native-toast-message";

type StatusFilter = "ALL" | TaskStatus;

const STATUS_LABELS: Record<StatusFilter, string> = {
  ALL: "All",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export function TaskList() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [actionMenuTask, setActionMenuTask] = useState<Task | null>(null);
  const [menuY, setMenuY] = useState(0);

  const fetchTasks = useCallback(async (isRefresh = false) => {
    try {
      const data = await tasksApi.list();
      setAllTasks(data);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err instanceof Error ? err.message : "Failed to load tasks",
      });
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks(true);
  }, [fetchTasks]);

  const filtered = allTasks.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    ALL: allTasks.length,
    TODO: allTasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: allTasks.filter((t) => t.status === "DONE").length,
  };

  const handleDelete = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionMenuTask(null);
    try {
      await tasksApi.delete(id);
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
      Toast.show({ type: "success", text1: "Task deleted" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err instanceof Error ? err.message : "Failed to delete task",
      });
    }
  };

  const openEdit = (task: Task) => {
    setActionMenuTask(null);
    router.push({
      pathname: "/task-modal",
      params: { id: task.id.toString(), taskData: JSON.stringify(task) },
    });
  };

  const openCreate = () => {
    router.push({ pathname: "/(tabs)/new-task" });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title + New task */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.screenTitle}>Tasks</Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openCreate();
          }}
          style={styles.newBtn}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.newBtnText}>New task</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={16} color="#a3a3a3" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#a3a3a3"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((key) => {
          const active = statusFilter === key;
          return (
            <Pressable
              key={key}
              onPress={() => {
                Haptics.selectionAsync();
                setStatusFilter(key);
              }}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {STATUS_LABELS[key]}
              </Text>
              <View style={[styles.countBadge, active && styles.countBadgeActive]}>
                <Text style={[styles.countText, active && styles.countTextActive]}>
                  {counts[key]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Inbox size={32} color="#d4d4d8" />
      </View>
      <Text style={styles.emptyTitle}>
        {allTasks.length === 0 ? "No tasks yet" : "No results"}
      </Text>
      <Text style={styles.emptyDesc}>
        {allTasks.length === 0
          ? "Create your first task to get started"
          : "Try a different search or filter"}
      </Text>
      {allTasks.length === 0 && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openCreate();
          }}
          style={styles.emptyBtn}
        >
          <Plus size={14} color="#171717" />
          <Text style={styles.emptyBtnText}>Create task</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onEdit={openEdit}
            onDelete={handleDelete}
            onLongPress={(task, y) => {
              setMenuY(y);
              setActionMenuTask(task);
            }}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={filtered.length === 0 ? styles.listEmpty : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      )}

      {/* Action popover */}
      <Modal
        visible={!!actionMenuTask}
        transparent
        animationType="fade"
        onRequestClose={() => setActionMenuTask(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setActionMenuTask(null)}>
          <View style={[styles.popover, { top: menuY }]} onStartShouldSetResponder={() => true}>
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle} numberOfLines={1}>
                {actionMenuTask?.title}
              </Text>
              <Pressable onPress={() => setActionMenuTask(null)} hitSlop={6}>
                <X size={14} color="#a3a3a3" />
              </Pressable>
            </View>
            <View style={styles.popoverDivider} />
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                actionMenuTask && openEdit(actionMenuTask);
              }}
              style={styles.popoverItem}
            >
              <Pencil size={15} color="#525252" />
              <Text style={styles.popoverItemText}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                actionMenuTask && handleDelete(actionMenuTask.id);
              }}
              style={styles.popoverItem}
            >
              <Trash2 size={15} color="#dc2626" />
              <Text style={[styles.popoverItemText, { color: "#dc2626" }]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#171717",
    letterSpacing: -0.3,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#171717",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  newBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: "#171717",
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
  },
  filterPillActive: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#525252",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  countBadge: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  countBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  countText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
  },
  countTextActive: {
    color: "#ffffff",
  },
  listContent: {
    paddingBottom: 40,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: "#737373",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#171717",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 14,
    color: "#737373",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  popover: {
    position: "absolute",
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  popoverHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  popoverTitle: {
    fontSize: 12,
    color: "#737373",
    flex: 1,
  },
  popoverDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 8,
  },
  popoverItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  popoverItemText: {
    fontSize: 14,
    color: "#171717",
  },
});
