

"use client";

import { CSS } from '@dnd-kit/utilities';
import type { Task, Category, Status } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { TaskDialog } from './task-dialog';
import { PriorityIcon, getPriorityLabel } from './priority-icon';
import { GripVertical, Briefcase, Home } from 'lucide-react';
import { Button } from './ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  isOverlay?: boolean;
  categoryFilter: Category | 'all';
  status: Status;
}

export function TaskCard({ task, onTaskUpdate, isOverlay, categoryFilter, status }: TaskCardProps) {
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

  const isDone = status === 'Done';

  if (isDone) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} className={cn(isOverlay && "ring-2 ring-primary", "w-full")}>
        <TaskDialog onSave={onTaskUpdate} task={task} trigger={
          <Card className={cn("mb-3 hover:shadow-md transition-shadow duration-200 group rounded-lg border", isDragging && "opacity-50")}>
            <div className="flex items-center justify-between p-3 cursor-pointer w-full overflow-hidden">
              <CardTitle className="text-base font-normal leading-tight truncate whitespace-nowrap pr-2">{task.title}</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing shrink-0" {...listeners} onClick={(e) => e.stopPropagation()}>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </Card>
        } />
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={cn(isOverlay && "ring-2 ring-primary")}>
      <TaskDialog onSave={onTaskUpdate} task={task} trigger={
        <Card className={cn("mb-3 hover:shadow-md transition-shadow duration-200 group rounded-lg border", isDragging && "opacity-50")}>
          <CardHeader className="p-3 pb-1">
             <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold leading-tight pr-4 cursor-pointer">{task.title}</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing shrink-0" {...listeners} onClick={(e) => e.stopPropagation()}>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-3 pt-1 text-sm cursor-pointer">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PriorityIcon priority={task.priority} className="h-4 w-4" />
              <span>{getPriorityLabel(task.priority)}</span>
            </div>
            <div className='flex items-center gap-2'>
                {categoryFilter === 'all' && (task.category === 'work' ? <Briefcase className="h-4 w-4 text-muted-foreground" /> : <Home className="h-4 w-4 text-muted-foreground" />)}
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
