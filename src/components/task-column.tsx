
"use client";

import { useDroppable } from '@dnd-kit/core';
import type { Task, Status } from '@/lib/types';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { TaskDialog } from './task-dialog';

interface TaskColumnProps {
  status: Status;
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const statusConfig: Record<Status, { color: string, title: string }> = {
  'Yet to Start': { color: 'bg-gray-500', title: 'Yet to Start' },
  'WIP': { color: 'bg-blue-500', title: 'Work in Progress' },
  'In Review': { color: 'bg-purple-500', title: 'In Review' },
  'Done': { color: 'bg-green-500', title: 'Done' },
};


export function TaskColumn({ status, tasks, onTaskUpdate }: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status: status,
    }
  });

  const config = statusConfig[status];
  const taskIds = tasks.map(t => t.id);

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg bg-card border-sketchy',
        isOver ? 'border-primary border-2' : ''
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-foreground p-4">
        <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', config.color)} />
            <h2 className="font-semibold">{config.title}</h2>
            <span className="text-sm text-muted-foreground">{tasks.length}</span>
        </div>
        <TaskDialog
            onSave={onTaskUpdate}
            initialStatus={status}
            trigger={
                <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            }
        />
      </div>
      <ScrollArea className="flex-1">
        <div ref={setNodeRef} className="p-4 min-h-[400px]">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length > 0 ? (
              tasks.map(task => <TaskCard key={task.id} task={task} onTaskUpdate={onTaskUpdate}/>)
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">Drop tasks here</p>
              </div>
            )}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}
