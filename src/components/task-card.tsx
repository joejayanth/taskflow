"use client";

import { CSS } from '@dnd-kit/utilities';
import type { Task, Category, Status } from '@/lib/types';
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
      <div ref={setNodeRef} style={style} {...attributes} className={cn("mb-3", isOverlay && "ring-2 ring-primary z-50")}>
        <Card className={cn(
          "hover:shadow-md transition-all duration-200 group rounded-lg border bg-card/50",
          isDragging && "opacity-50"
        )}>
          <div className="flex items-center gap-2 p-3">
            <TaskDialog onSave={onTaskUpdate} onDelete={onTaskDelete} task={task} trigger={
              <div className="flex-1 min-w-0 cursor-pointer">
                <p className="text-sm font-medium leading-relaxed text-muted-foreground line-through decoration-muted-foreground/50 break-words">
                  {task.title}
                </p>
              </div>
            } />
            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" {...listeners} onClick={(e) => e.stopPropagation()}>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={cn("mb-3", isOverlay && "ring-2 ring-primary z-50")}>
      <Card className={cn(
        "hover:shadow-lg transition-all duration-200 group rounded-lg border bg-card",
        isDragging && "opacity-50",
        task.blocked && "border-destructive/30 bg-destructive/5"
      )}>
        <CardHeader className="p-3 pb-1">
          <div className="flex items-start justify-between gap-2">
            <TaskDialog onSave={onTaskUpdate} onDelete={onTaskDelete} task={task} trigger={
              <CardTitle className="text-[15px] font-semibold leading-snug cursor-pointer group-hover:text-primary transition-colors">
                {task.title}
              </CardTitle>
            } />
            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" {...listeners} onClick={(e) => e.stopPropagation()}>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <PriorityIcon priority={task.priority} className="h-3.5 w-3.5" />
              <span>{getPriorityLabel(task.priority)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {categoryFilter === 'all' && (
                task.category === 'work' ? 
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> : 
                <Home className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <Badge
                variant={isOverdue ? 'destructive' : 'outline'}
                className={cn(
                  "font-medium py-0 px-2 h-5 text-[11px] uppercase tracking-wider",
                  !isOverdue && "bg-muted/50 border-none"
                )}
              >
                {format(dueDate, "MMM d")}
              </Badge>
            </div>
          </div>
          {task.blocked && (
            <div className="flex items-center gap-1.5 text-destructive font-semibold text-[11px] uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Blocked</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}