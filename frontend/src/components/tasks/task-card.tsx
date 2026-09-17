import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, TaskStatus } from "@/lib/api";
import { MoreHorizontal, Pencil, Trash2, Clock, CheckCircle2, Circle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof Clock }> = {
  TODO: { label: "To do", variant: "secondary", icon: Circle },
  IN_PROGRESS: { label: "In progress", variant: "default", icon: Clock },
  DONE: { label: "Done", variant: "outline", icon: CheckCircle2 },
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const config = STATUS_CONFIG[task.status];
  const StatusIcon = config.icon;

  return (
    <Card className="group transition-all hover:shadow-md hover:border-muted-foreground/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-medium leading-snug ${
                  task.status === "DONE" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </h3>
              <Badge variant={config.variant} className="shrink-0 text-xs gap-1">
                <StatusIcon className="size-3" />
                {config.label}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground/60">
              {new Date(task.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100 cursor-pointer" />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
