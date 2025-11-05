"use client";

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { TaskDialog } from './task-dialog';
import { PriorityIcon, getPriorityLabel } from './priority-icon';
import { GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { useSortable } from '@dnd-kit/sortable';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
}

export function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'Done';

  const handleBlockedChange = (checked: boolean) => {
    onTaskUpdate({ ...task, blocked: checked });
  };


  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskDialog onSave={onTaskUpdate} task={task} trigger={
        <Card className="mb-4 hover:shadow-md transition-shadow duration-200 group">
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
           <div className="px-4 pb-4 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={`blocked-${task.id}`}
                  checked={!!task.blocked}
                  onCheckedChange={handleBlockedChange}
                />
                <label
                  htmlFor={`blocked-${task.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Blocked
                </label>
            </div>
        </Card>
      } />
    </div>
  );
}
