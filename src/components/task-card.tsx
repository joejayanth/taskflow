"use client";

import { CSS } from '@dnd-kit/utilities';
import type { Task, Category, Status, Priority } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { TaskDialog } from './task-dialog';
import { PriorityIcon, getPriorityLabel } from './priority-icon';
import { GripVertical, Briefcase, Home, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  isOverlay?: boolean;
  categoryFilter: Category | 'all';
  status: Status;
}

// Priority-colored left border
const priorityBorderClass: Record<Priority, string> = {
  P0: 'border-l-[3px] border-l-red-500',
  P1: 'border-l-[3px] border-l-orange-400',
  P2: 'border-l-[3px] border-l-amber-400',
  P3: 'border-l-[3px] border-l-slate-300 dark:border-l-slate-600',
};

export function TaskCard({ task, onTaskUpdate, onTaskDelete, isOverlay, categoryFilter, status }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'Done';
  const isDone = status === 'Done';

  if (isDone) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} className={cn("mb-2", isOverlay && "ring-2 ring-primary z-50 rounded-lg")}>
        <Card className={cn(
          "hover:shadow-sm transition-all duration-200 group rounded-lg border bg-card/40",
          isDragging && "opacity-40"
        )}>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <TaskDialog onSave={onTaskUpdate} onDelete={onTaskDelete} task={task} trigger={
              <div className="flex-1 min-w-0 cursor-pointer">
                <p className="text-sm font-medium leading-snug text-muted-foreground/60 line-through decoration-muted-foreground/30 break-words">
                  {task.title}
                </p>
              </div>
            } />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-70 transition-opacity"
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const descriptionSnippet = task.description && task.description.trim().length > 0
    ? task.description.trim().slice(0, 72) + (task.description.trim().length > 72 ? '…' : '')
    : null;

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={cn("mb-2.5", isOverlay && "ring-2 ring-primary z-50 rounded-xl")}>
      <Card className={cn(
        "hover:shadow-md transition-all duration-200 group rounded-xl border overflow-hidden",
        priorityBorderClass[task.priority],
        isDragging && "opacity-40",
        task.blocked && "border-destructive/40 bg-destructive/5"
      )}>
        <CardHeader className="p-3 pb-1.5">
          <div className="flex items-start justify-between gap-2">
            <TaskDialog onSave={onTaskUpdate} onDelete={onTaskDelete} task={task} trigger={
              <CardTitle className="text-[14px] font-semibold leading-snug cursor-pointer hover:text-primary transition-colors flex-1">
                {task.title}
              </CardTitle>
            } />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-70 transition-opacity mt-0.5"
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-3 pb-3 pt-1 space-y-2">
          {/* Description snippet */}
          {descriptionSnippet && (
            <TaskDialog onSave={onTaskUpdate} onDelete={onTaskDelete} task={task} trigger={
              <p className="text-[12px] text-muted-foreground/70 leading-relaxed cursor-pointer line-clamp-2">
                {descriptionSnippet}
              </p>
            } />
          )}

          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1 text-muted-foreground font-medium">
              <PriorityIcon priority={task.priority} className="h-3.5 w-3.5" />
              <span>{getPriorityLabel(task.priority)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {categoryFilter === 'all' && (
                task.category === 'work'
                  ? <Briefcase className="h-3 w-3 text-muted-foreground/60" />
                  : <Home className="h-3 w-3 text-muted-foreground/60" />
              )}
              <Badge
                variant={isOverdue ? 'destructive' : 'outline'}
                className={cn(
                  "font-semibold py-0 px-1.5 h-[18px] text-[10px] uppercase tracking-wider rounded-md",
                  !isOverdue && "bg-muted/60 border-transparent text-muted-foreground"
                )}
              >
                {format(dueDate, "MMM d")}
              </Badge>
            </div>
          </div>

          {task.blocked && (
            <div className="flex items-center gap-1 text-destructive font-semibold text-[10px] uppercase tracking-wider">
              <ShieldAlert className="h-3 w-3" />
              <span>Blocked</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
