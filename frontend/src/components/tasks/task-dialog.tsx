import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, CreateTaskPayload, TaskStatus } from "@/lib/api";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateTaskPayload) => Promise<void>;
  task?: Task | null;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

function validateTitle(v: string): string | null {
  if (!v.trim()) return "Title is required";
  if (v.trim().length < 2) return "Title must be at least 2 characters";
  if (v.trim().length > 255) return "Title must be under 255 characters";
  return null;
}

function validateDescription(v: string): string | null {
  if (v.length > 2000) return "Description must be under 2000 characters";
  return null;
}

export function TaskDialog({ open, onOpenChange, onSave, task }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setStatus(task?.status ?? "TODO");
      setErrors({});
      setTouched({});
    }
  }, [open, task]);

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};
    const t = validateTitle(title);
    const d = validateDescription(description);
    if (t) newErrors.title = t;
    if (d) newErrors.description = d;
    setErrors(newErrors);
    setTouched({ title: true, description: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), status });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: "title" | "description") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === "title" ? title : description;
    const err = field === "title" ? validateTitle(value) : validateDescription(value);
    setErrors((prev) => ({ ...prev, [field]: err ?? undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) {
                  const err = validateTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: err ?? undefined }));
                }
              }}
              onBlur={() => handleBlur("title")}
              aria-invalid={!!errors.title}
              className={errors.title ? "border-destructive focus-visible:ring-destructive/50" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Add more details (optional)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (touched.description) {
                  const err = validateDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: err ?? undefined }));
                }
              }}
              onBlur={() => handleBlur("description")}
              aria-invalid={!!errors.description}
              className={errors.description ? "border-destructive focus-visible:ring-destructive/50" : ""}
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {STATUS_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
