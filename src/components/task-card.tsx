

"use client";

import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { TaskDialog } from './task-dialog';
import { PriorityIcon, getPriorityLabel } from './priority-icon';
import { GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  isOverlay?: boolean;
}

export function TaskCard({ task, onTaskUpdate, isOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: {type: 'Task', task} });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'Done';

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={cn(isOverlay && "ring-2 ring-primary")}>
      <TaskDialog onSave={onTaskUpdate} task={task} trigger={
        <Card className={cn("mb-4 hover:shadow-md transition-shadow duration-200 group", isDragging && "opacity-50")}>
          <CardHeader className="p-4 pb-2">
             <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold leading-tight pr-4 cursor-pointer">{task.title}</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing shrink-0" {...listeners} onClick={(e) => e.stopPropagation()}>
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
                {task.blocked && <Badge variant="destructive">Blocked</Badge>}
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
