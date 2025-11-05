"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { TaskDialog } from './task-dialog';
import { PriorityIcon, getPriorityLabel } from './priority-icon';
import { GripVertical } from 'lucide-react';
import { Button } from './ui/button';

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

  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'Done';

  return (
    <div ref={setNodeRef} style={style}>
      <TaskDialog onSave={onTaskUpdate} task={task} trigger={
        <Card className="mb-4 hover:shadow-md transition-shadow duration-200 group">
          <CardHeader className="p-4 pb-2">
             <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold leading-tight pr-4 cursor-pointer">{task.title}</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing shrink-0" {...listeners} {...attributes} onClick={(e) => e.stopPropagation()}>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-4 pt-2 text-sm cursor-pointer">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PriorityIcon priority={task.priority} className="h-4 w-4" />
              <span>{getPriorityLabel(task.priority)}</span>
            </div>
            <div className='flex items-center gap-2'>
                {task.blocked && <Badge variant="secondary">Blocked</Badge>}
                <Badge
                variant={isOverdue ? 'destructive' : 'outline'}
                className="font-normal"
                >
                {format(dueDate, "MMM d")}
                </Badge>
            </div>
          </CardContent>
        </Card>
      } />
    </div>
  );
}
