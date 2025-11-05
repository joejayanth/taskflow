"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Task, Status } from '@/lib/types';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { AppHeader } from '@/components/app-header';
import { TaskBoard } from '@/components/task-board';
import { FocusRecommendation } from '@/components/focus-recommendation';
import { initialTasks } from '@/lib/data';

const statuses: Status[] = ['Yet to Start', 'WIP', 'In Review', 'Done'];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tasksByStatus = useMemo(() => {
    const grouped: { [key in Status]: Task[] } = {
      'Yet to Start': [],
      'WIP': [],
      'In Review': [],
      'Done': [],
    };
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    // Sort tasks in each column by due date
    for (const status in grouped) {
      grouped[status as Status].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }
    return grouped;
  }, [tasks]);

  const handleTaskUpdate = (updatedTask: Task) => {
    const taskExists = tasks.some(t => t.id === updatedTask.id);
    if (taskExists) {
      setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    } else {
      setTasks([...tasks, updatedTask]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as Status;
      
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        const updatedTask: Task = {
          ...task,
          status: newStatus,
          history: [...task.history, { status: newStatus, timestamp: new Date() }],
        };
        handleTaskUpdate(updatedTask);
      }
    }
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <AppHeader onTaskCreate={handleTaskUpdate} />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <FocusRecommendation tasks={tasks} />
          {isClient && (
            <DndContext onDragEnd={handleDragEnd}>
              <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} />
            </DndContext>
          )}
        </div>
      </main>
    </div>
  );
}
