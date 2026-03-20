"use client";

import { useDroppable } from '@dnd-kit/core';
import type { Task, Status, Category } from '@/lib/types';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { TaskDialog } from './task-dialog';
import { DoneColumnActions } from './done-column-actions';

interface TaskColumnProps {
  status: Status;
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onDeleteAll?: (tasks: Task[]) => void;
  categoryFilter: Category | 'all';
}

const statusConfig: Record<Status, { color: string, title: string, bg: string }> = {
  'Yet to Start': { color: 'bg-slate-400', title: 'To Do', bg: 'bg-slate-50/50' },
  'WIP': { color: 'bg-blue-500', title: 'In Progress', bg: 'bg-blue-50/30' },
  'In Review': { color: 'bg-amber-500', title: 'Review', bg: 'bg-amber-50/30' },
  'Done': { color: 'bg-emerald-500', title: 'Completed', bg: 'bg-emerald-50/30' },
};

export function TaskColumn({ status, tasks, onTaskUpdate, onTaskDelete, onDeleteAll, categoryFilter }: TaskColumnProps) {
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
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border border-border/60 transition-colors duration-200 h-full',
        config.bg,
        isOver ? 'ring-2 ring-primary ring-offset-2' : ''
      )}
    >
      <div className="flex items-center justify-between gap-2 p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <span className={cn('h-2 w-2 rounded-full', config.color)} />
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{config.title}</h2>
          <Badge variant="secondary" className="font-bold bg-muted/60 text-[11px] px-1.5 h-5 min-w-[20px] flex justify-center">{tasks.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <TaskDialog
            onSave={onTaskUpdate}
            initialStatus={status}
            initialCategory={categoryFilter === 'all' ? 'work' : categoryFilter}
            trigger={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/80 rounded-full">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add task to {config.title}</span>
              </Button>
            }
          />
          {status === 'Done' && onDeleteAll && <DoneColumnActions tasks={tasks} onDeleteAll={onDeleteAll} />}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 min-h-[400px]">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length > 0 ? (
              tasks.map(task => <TaskCard key={task.id} task={task} onTaskUpdate={onTaskUpdate} onTaskDelete={onTaskDelete} categoryFilter={categoryFilter} status={status} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-muted/40 opacity-40">
                <p className="text-xs font-semibold uppercase tracking-widest">No Tasks</p>
              </div>
            )}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}

import { Badge } from './ui/badge';