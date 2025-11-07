
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Task, Status, Priority, Category } from '@/lib/types';
import { DndContext, type DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AppHeader } from '@/components/app-header';
import { TaskBoard } from '@/components/task-board';
import { FocusRecommendation } from '@/components/focus-recommendation';
import { Reminders } from '@/components/reminders';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { TaskCard } from '@/components/task-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setIsClient(true);
    const savedFilter = localStorage.getItem('taskCategoryFilter') as Category | 'all' | null;
    if (savedFilter) {
      setCategoryFilter(savedFilter);
    }
  }, []);

  const handleFilterChange = (value: string) => {
    const filterValue = value as Category | 'all';
    setCategoryFilter(filterValue);
    localStorage.setItem('taskCategoryFilter', filterValue);
  }

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
      history: task.history.map(h => ({...h, timestamp: new Date(h.timestamp)})),
      reminderDate: task.reminderDate ? new Date(task.reminderDate) : undefined,
    }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (categoryFilter === 'all') {
      return tasksWithDateObjects;
    }
    return tasksWithDateObjects.filter(task => task.category === categoryFilter);
  }, [tasksWithDateObjects, categoryFilter]);

  const reminderTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (filteredTasks as Task[]).filter(task => {
      if (task.status === 'Done' || !task.reminderDate) {
        return false;
      }
      const reminderDate = new Date(task.reminderDate);
      reminderDate.setHours(0, 0, 0, 0);
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const shouldRemind = reminderDate.getTime() <= today.getTime() && today.getTime() < dueDate.getTime();

      return shouldRemind;
    });
  }, [filteredTasks]);

  const tasksByStatus = useMemo(() => {
    const grouped: { [key in Status]: Task[] } = {
      'Yet to Start': [],
      'WIP': [],
      'In Review': [],
      'Done': [],
    };
    if (filteredTasks) {
      filteredTasks.forEach((task) => {
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
  }, [filteredTasks]);

  const handleTaskUpdate = (updatedTask: Task) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'tasks', updatedTask.id);
    
    const taskForFirestore: any = {
      ...updatedTask,
      dueDate: updatedTask.dueDate.toISOString(),
      reminderDate: updatedTask.reminderDate ? updatedTask.reminderDate.toISOString() : null,
      history: updatedTask.history.map(h => ({
        ...h,
        timestamp: h.timestamp.toISOString()
      }))
    };
    
    // Firestore does not accept `undefined` so we must delete the key if it's nullish.
    if (!taskForFirestore.reminderDate) {
      delete taskForFirestore.reminderDate;
    }
    
    setDocumentNonBlocking(taskRef, taskForFirestore, { merge: true });
  };

  const handleDeleteAllDone = (tasksToDelete: Task[]) => {
    if (!user || !firestore) return;

    const batch = writeBatch(firestore);
    tasksToDelete.forEach(task => {
        const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
        batch.delete(taskRef);
    });
    batch.commit().catch(err => {
        console.error("Failed to delete all done tasks:", err);
    })
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

  const hasReminders = reminderTasks.length > 0;

  return (
    <div className="flex h-screen flex-col">
      <AppHeader onTaskCreate={handleTaskUpdate} categoryFilter={categoryFilter} />
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className={hasReminders ? "lg:col-span-2" : "lg:col-span-4"}>
              <FocusRecommendation tasks={filteredTasks as Task[]} onTaskUpdate={handleTaskUpdate} />
            </div>
            {hasReminders && (
              <div className="lg:col-span-2">
                <Reminders tasks={reminderTasks} onTaskUpdate={handleTaskUpdate} />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Tabs value={categoryFilter} onValueChange={handleFilterChange}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="work">Work</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
           {isClient ? (
            <DndContext 
              sensors={sensors}
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd} 
              onDragCancel={handleDragCancel}
            >
              <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} onDeleteAllDone={handleDeleteAllDone} categoryFilter={categoryFilter} />
               <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} onTaskUpdate={handleTaskUpdate} isOverlay categoryFilter={categoryFilter} /> : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <TaskBoard statuses={statuses} tasksByStatus={tasksByStatus} onTaskUpdate={handleTaskUpdate} onDeleteAllDone={handleDeleteAllDone} categoryFilter={categoryFilter} />
          )}
        </div>
      </div>
    </div>
  );
}
