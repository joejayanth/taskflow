
"use client";

import { CircleCheck, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/task-dialog";
import type { Task, Category } from "@/lib/types";
import { UserProfile } from "./user-profile";
import { ThemeToggle } from "./theme-toggle";

interface AppHeaderProps {
  onTaskCreate: (task: Task) => void;
  categoryFilter: Category | 'all';
}

export function AppHeader({ onTaskCreate, categoryFilter }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <CircleCheck className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold">TaskFlow</h1>
        </div>
        <div className="flex items-center gap-4">
          <TaskDialog 
            onSave={onTaskCreate} 
            initialCategory={categoryFilter === 'all' ? 'work' : categoryFilter}
            trigger={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Task
              </Button>
            } 
          />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
