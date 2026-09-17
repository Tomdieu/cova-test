import { useState, useEffect, useCallback } from "react";
import { tasks, type Task, type TaskStatus, type CreateTaskPayload } from "@/lib/api";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, X, ListTodo, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasks.list();
      setAllTasks(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
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

  const handleCreate = async (data: CreateTaskPayload) => {
    try {
      const created = await tasks.create(data);
      setAllTasks((prev) => [created, ...prev]);
      toast.success("Task created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
      throw err;
    }
  };

  const handleUpdate = async (data: CreateTaskPayload) => {
    if (!editingTask) return;
    try {
      const updated = await tasks.update(editingTask.id, data);
      setAllTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success("Task updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tasks.delete(id);
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.ALL} total · {counts.TODO} to do · {counts.IN_PROGRESS} in progress · {counts.DONE} done
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          New task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === key
                  ? "bg-background shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {STATUS_LABELS[key]}
              <Badge
                variant="secondary"
                className="ml-1.5 text-xs px-1.5 py-0"
              >
                {counts[key]}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListTodo className="size-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-medium text-lg">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {allTasks.length === 0
              ? "Create your first task to get started"
              : "Try adjusting your search or filter"}
          </p>
          {allTasks.length === 0 && (
            <Button onClick={openCreate} className="mt-4 gap-2">
              <Plus className="size-4" />
              Create task
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdate : handleCreate}
        task={editingTask}
      />
    </div>
  );
}
