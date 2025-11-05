
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Task, Status, Priority } from '@/lib/types';
import { DndContext, type DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AppHeader } from '@/components/app-header';
import { TaskBoard } from '@/components/task-board';
import { FocusRecommendation } from '@/components/focus-recommendation';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { TaskCard } from '@/components/task-card';

const statuses: Status[] = ['Yet to Start', 'WIP', 'In Review', 'Done'];
const priorityOrder: Record<Priority, number> = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };

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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const tasksWithDateObjects = useMemo(() => {
    if (!tasks) return [];
    return tasks.map(task => ({
      ...task,
      dueDate: new Date(task.dueDate),
      history: task.history.map(h => ({...h, timestamp: new Date(h.timestamp)}))
    }));
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    const grouped: { [key in Status]: Task[] } = {
      'Yet to Start': [],
      'WIP': [],
      'In Review': [],
      'Done': [],
    };
    if (tasksWithDateObjects) {
      tasksWithDateObjects.forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task as Task);
        }
      });
    }
    
    // Sort tasks in each column
    for (const status in grouped) {
      grouped[status as Status].sort((a, b) => {
        // Sort by priority first
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        // Then by due date (earlier first)
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
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
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasksWithDateObjects.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task as Task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
  
    if (!over) return;
  
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId === overId) return;
  
    const task = tasksWithDateObjects.find((t) => t.id === activeId);
  
    // Check if dropping into a column
    const isOverAColumn = over.data.current?.type === 'Column';
  
    if (task && isOverAColumn) {
      const newStatus = over.data.current.status as Status;
      if (task.status !== newStatus) {
        const updatedTask: Task = {
          ...task,
          status: newStatus,
          history: [
            ...task.history,
            { status: newStatus, timestamp: new Date() },
          ],
        };
        handleTaskUpdate(updatedTask);
      }
    }
  };
  
  const handleDragCancel = () => {
    setActiveTask(null);
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
          <FocusRecommendation tasks={tasksWithDateObjects as Task[]} onTaskUpdate={handleTaskUpdate} />
           {isClient ? (
            <DndContext 
              sensors={sensors}
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd} 
              onDragCancel={handleDragCancel}
            >
              <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} />
               <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} onTaskUpdate={handleTaskUpdate} isOverlay /> : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} />
          )}
        </div>
      </main>
    </div>
  );
}
