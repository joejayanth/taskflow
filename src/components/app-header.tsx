"use client";

import { CircleCheck, PlusCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/task-dialog";
import type { Task, Category } from "@/lib/types";
import { UserProfile } from "./user-profile";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "@/components/ui/input";

interface AppHeaderProps {
  onTaskCreate: (task: Task) => void;
  categoryFilter: Category | 'all';
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AppHeader({ onTaskCreate, categoryFilter, searchQuery, onSearchChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <CircleCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-xs relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 bg-muted/50 border-muted focus-visible:bg-background text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <TaskDialog
            onSave={onTaskCreate}
            initialCategory={categoryFilter === 'all' ? 'work' : categoryFilter}
            trigger={
              <Button size="sm" className="gap-1.5 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </Button>
            }
          />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden border-t px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 bg-muted/50 border-muted text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
