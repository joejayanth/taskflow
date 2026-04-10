"use client";

import { useMemo } from "react";
import type { Task, Priority } from "@/lib/types";
import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityIcon, getPriorityLabel } from "./priority-icon";
import { format, isToday, getDay, addDays } from "date-fns";
import { TaskDialog } from "./task-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface FocusRecommendationProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
}

const priorityOrder: Record<Priority, number> = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };

const priorityChipClass: Record<Priority, string> = {
  P0: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-900',
  P1: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200 dark:border-orange-900',
  P2: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  P3: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const statusBadgeClass: Record<string, string> = {
  'Yet to Start': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-transparent',
  'WIP': 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400 border-transparent',
  'In Review': 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-transparent',
};

const isBusinessDay = (date: Date) => {
  const day = getDay(date);
  return day !== 0 && day !== 6;
};

const getNextTwoBusinessDays = () => {
  let businessDays: Date[] = [];
  let date = addDays(new Date(), 1);
  while (businessDays.length < 2) {
    if (isBusinessDay(date)) businessDays.push(date);
    date = addDays(date, 1);
  }
  return businessDays;
};

const isDueSoon = (dueDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due.getTime() < today.getTime()) return true;
  if (isToday(due)) return true;
  const nextTwoBusinessDays = getNextTwoBusinessDays();
  const next1 = nextTwoBusinessDays[0];
  next1.setHours(0, 0, 0, 0);
  const next2 = nextTwoBusinessDays[1];
  next2.setHours(0, 0, 0, 0);
  return due.getTime() === next1.getTime() || due.getTime() === next2.getTime();
};

const getTaskSortScore = (task: Task): number => {
  const imminent = isDueSoon(new Date(task.dueDate));
  const baseScore = imminent ? 0 : 10;
  if (task.priority === 'P0' && task.status === 'Yet to Start') return baseScore + 0;
  if (task.priority === 'P0' && task.status === 'WIP') return baseScore + 1;
  if (task.priority === 'P1' && task.status === 'Yet to Start') return baseScore + 2;
  if (task.priority === 'P1' && task.status === 'WIP') return baseScore + 3;
  if (task.status === 'In Review') return baseScore + 4;
  return baseScore + 5 + priorityOrder[task.priority];
};

export function FocusRecommendation({ tasks, onTaskUpdate, onTaskDelete }: FocusRecommendationProps) {
  const recommendedTasks = useMemo(() => {
    const activeAndDueSoonTasks = tasks.filter(task =>
      task.status !== 'Done' && isDueSoon(new Date(task.dueDate))
    );
    return activeAndDueSoonTasks.sort((a, b) => {
      const scoreA = getTaskSortScore(a);
      const scoreB = getTaskSortScore(b);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }).slice(0, 3);
  }, [tasks]);

  return (
    <Card className="border-primary/15 shadow-none overflow-hidden rounded-xl">
      <CardHeader className="py-3 px-4 bg-primary/8 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Zap className="h-3.5 w-3.5 fill-primary" />
          <span>Priority Focus</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[136px]">
          {recommendedTasks.length > 0 ? (
            <div className="space-y-1">
              {recommendedTasks.map(task => (
                <TaskDialog
                  key={task.id}
                  task={task}
                  onSave={onTaskUpdate}
                  onDelete={onTaskDelete}
                  trigger={
                    <div className="group cursor-pointer rounded-lg px-2.5 py-2 transition-colors hover:bg-primary/8 flex items-center gap-3">
                      {/* Priority chip */}
                      <span className={cn(
                        "hidden sm:flex items-center gap-1 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        priorityChipClass[task.priority]
                      )}>
                        <PriorityIcon priority={task.priority} className="h-2.5 w-2.5" />
                        {getPriorityLabel(task.priority)}
                      </span>

                      {/* Title */}
                      <h3 className="flex-1 text-[13px] font-semibold truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>

                      {/* Status + Due date */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-[18px] text-[10px] font-bold uppercase tracking-wider px-1.5 rounded-md hidden md:flex",
                            statusBadgeClass[task.status] || 'border-transparent'
                          )}
                        >
                          {task.status === 'Yet to Start' ? 'To Do' : task.status === 'WIP' ? 'WIP' : 'Review'}
                        </Badge>
                        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                          {format(new Date(task.dueDate), "MMM d")}
                        </span>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[136px] items-center justify-center px-6 text-center">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground/50">All clear!</p>
                <p className="text-xs text-muted-foreground/40">No urgent tasks due soon.</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
