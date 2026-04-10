"use client";

import { useDroppable } from '@dnd-kit/core';
import type { Task, Status, Category } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from './ui/button';
import { Plus, Inbox } from 'lucide-react';
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

const statusConfig: Record<Status, {
  dot: string;
  title: string;
  bg: string;
  borderTop: string;
  headerText: string;
}> = {
  'Yet to Start': {
    dot: 'bg-slate-400',
    title: 'To Do',
    bg: 'bg-muted/20 dark:bg-muted/10',
    borderTop: 'border-t-slate-400',
    headerText: 'text-slate-600 dark:text-slate-400',
  },
  'WIP': {
    dot: 'bg-violet-500',
    title: 'In Progress',
    bg: 'bg-violet-50/40 dark:bg-violet-950/20',
    borderTop: 'border-t-violet-500',
    headerText: 'text-violet-700 dark:text-violet-400',
  },
  'In Review': {
    dot: 'bg-amber-500',
    title: 'Review',
    bg: 'bg-amber-50/40 dark:bg-amber-950/20',
    borderTop: 'border-t-amber-500',
    headerText: 'text-amber-700 dark:text-amber-400',
  },
  'Done': {
    dot: 'bg-emerald-500',
    title: 'Completed',
    bg: 'bg-emerald-50/30 dark:bg-emerald-950/15',
    borderTop: 'border-t-emerald-500',
    headerText: 'text-emerald-700 dark:text-emerald-400',
  },
};

export function TaskColumn({ status, tasks, onTaskUpdate, onTaskDelete, onDeleteAll, categoryFilter }: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: { type: 'Column', status }
  });

  const config = statusConfig[status];
  const taskIds = tasks.map(t => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        // No overflow-hidden here — it was clipping card content
        'flex flex-col rounded-xl border border-border/50 border-t-[3px] transition-all duration-200 h-full',
        config.borderTop,
        config.bg,
        isOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full shrink-0', config.dot)} />
          <h2 className={cn("font-bold text-xs uppercase tracking-widest", config.headerText)}>
            {config.title}
          </h2>
          <Badge
            variant="secondary"
            className="font-bold text-[15px] px-1.5 min-w-[20px] flex justify-center bg-background/60 border border-border/40"
          >
            {tasks.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <TaskDialog
            onSave={onTaskUpdate}
            initialStatus={status}
            initialCategory={categoryFilter === 'all' ? 'work' : categoryFilter}
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-background/60 rounded-lg">
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only">Add task to {config.title}</span>
              </Button>
            }
          />
          {status === 'Done' && onDeleteAll && (
            <DoneColumnActions tasks={tasks} onDeleteAll={onDeleteAll} />
          )}
        </div>
      </div>

      {/* Task list — min-h-0 is critical for flex-1 scroll areas to work correctly */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full px-3 pb-3 pt-1 min-h-[380px]">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                  categoryFilter={categoryFilter}
                  status={status}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-14 rounded-xl border-2 border-dashed border-muted/50 opacity-40">
                <Inbox className="h-5 w-5 text-muted-foreground" />
                <p className="text-[17px] font-semibold uppercase tracking-widest text-muted-foreground">
                  No Tasks
                </p>
              </div>
            )}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}
