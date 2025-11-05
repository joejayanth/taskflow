"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Task, Status } from '@/lib/types';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { AppHeader } from '@/components/app-header';
import { TaskBoard } from '@/components/task-board';
import { FocusRecommendation } from '@/components/focus-recommendation';
import { useAuth, useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';

const statuses: Status[] = ['Yet to Start', 'WIP', 'In Review', 'Done'];

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const tasksQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'tasks') : null, 
    [user, firestore]
  );
  
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Omit<Task, 'id'>>(tasksQuery);

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

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
    
    // Convert Date objects to ISO strings for Firestore
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

  if (isUserLoading || areTasksLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="text-lg">Loading your tasks...</div>
      </div>
    );
  }
  
  if (!user) {
     return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <p>Please sign in to manage your tasks.</p>
        <Button onClick={() => initiateAnonymousSignIn(auth)}>Sign In Anonymously</Button>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full flex-col">
      <AppHeader onTaskCreate={handleTaskUpdate} />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <FocusRecommendation tasks={tasksWithDateObjects as Task[]} />
          <DndContext onDragEnd={handleDragEnd}>
            <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} />
          </DndContext>
        </div>
      </main>
    </div>
  );
}
