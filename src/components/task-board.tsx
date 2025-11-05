"use client";

import type { Task, Status } from '@/lib/types';
import { TaskColumn } from '@/components/task-column';

interface TaskBoardProps {
  statuses: Status[];
  tasksByStatus: { [key in Status]: Task[] };
  onTaskUpdate: (task: Task) => void;
}

export function TaskBoard({ statuses, tasksByStatus, onTaskUpdate }: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statuses.map(status => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasksByStatus[status]}
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
}
