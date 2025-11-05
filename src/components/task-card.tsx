"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { TaskDialog } from './task-dialog';
import { PriorityIcon, getPriorityLabel } from './priority-icon';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
}

export function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const isOverdue = isPast(task.dueDate) && task.status !== 'Done';

  return (
    <TaskDialog onSave={onTaskUpdate} task={task} trigger={
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card className="mb-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200">
                <CardHeader className="p-4">
                <CardTitle className="text-base">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-4 pt-0 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <PriorityIcon priority={task.priority} className="h-4 w-4" />
                    <span>{getPriorityLabel(task.priority)}</span>
                </div>
                <Badge
                    variant={isOverdue ? 'destructive' : 'outline'}
                    className="font-normal"
                >
                    {format(task.dueDate, "MMM d")}
                </Badge>
                </CardContent>
            </Card>
        </div>
    }/>
  );
}
