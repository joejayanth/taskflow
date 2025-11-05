"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Task, Status } from '@/lib/types';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { AppHeader } from '@/components/app-header';
import { TaskBoard } from '@/components/task-board';
import { FocusRecommendation } from '@/components/focus-recommendation';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const statuses: Status[] = ['Yet to Start', 'WIP', 'In Review', 'Done'];

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const tasksQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'tasks') : null, 
    [user, firestore]
  );
  
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Omit<Task, 'id'>>(tasksQuery);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const tasksWithDateObjects = useMemo(() => {
    return tasks?.map(task => ({
      ...task,
      dueDate: new Date(task.dueDate),
      history: task.history.map(h => ({...h, timestamp: new Date(h.timestamp)}))
    })) || [];
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    const grouped: { [key in Status]: Task[] } = {
      'Yet to Start': [],
      'WIP': [],
      'In Review': [],
      'Done': [],
    };
    tasksWithDateObjects.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task as Task);
      }
    });
    // Sort tasks in each column by due date
    for (const status in grouped) {
      grouped[status as Status].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }
    return grouped;
  }, [tasksWithDateObjects]);

  const handleTaskUpdate = (updatedTask: Task) => {
    if (!user) return;
    const taskRef = doc(firestore, 'users', user.uid, 'tasks', updatedTask.id);
    
    const taskForFirestore = {
      ...updatedTask,
      dueDate: updatedTask.dueDate.toISOString(),
      history: updatedTask.history.map(h => ({
        ...h,
        timestamp: h.timestamp.toISOString()
      }))
    };
    
    setDocumentNonBlocking(taskRef, taskForFirestore, { merge: true });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as Status;
      
      const task = tasksWithDateObjects.find(t => t.id === taskId);
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

  if (isUserLoading || areTasksLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="text-lg">Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <AppHeader onTaskCreate={handleTaskUpdate} />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <FocusRecommendation tasks={tasksWithDateObjects as Task[]} />
           {isClient ? (
            <DndContext onDragEnd={handleDragEnd}>
              <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} />
            </DndContext>
          ) : (
            <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} />
          )}
        </div>
      </main>
    </div>
  );
}
