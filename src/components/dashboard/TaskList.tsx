import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  client?: string;
}

interface TaskListProps {
  tasks: Task[];
  onToggle?: (id: string) => void;
}

export function TaskList({ tasks, onToggle }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all duration-200",
            task.completed && "opacity-60"
          )}
        >
          <button
            onClick={() => onToggle?.(task.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium truncate",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>
            {task.client && (
              <p className="text-xs text-muted-foreground">{task.client}</p>
            )}
          </div>
          {task.time && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{task.time}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
