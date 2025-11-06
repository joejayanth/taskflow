
"use client";

import { useMemo } from "react";
import type { Task, Priority, Status } from "@/lib/types";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityIcon, getPriorityLabel } from "./priority-icon";
import { format, isPast, differenceInCalendarDays } from "date-fns";
import { TaskDialog } from "./task-dialog";
import { ScrollArea } from "./ui/scroll-area";

interface FocusRecommendationProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const priorityOrder: Record<Priority, number> = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };

const isImminent = (dueDate: Date): boolean => {
  const today = new Date();
  if (isPast(dueDate) && !isToday(dueDate)) {
    return true; // Overdue
  }
  const daysUntilDue = differenceInCalendarDays(dueDate, today);
  return daysUntilDue >= 0 && daysUntilDue <= 2; // Due today or in the next 2 days
};

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

const getTaskSortScore = (task: Task): number => {
    const imminent = isImminent(new Date(task.dueDate));
    const baseScore = imminent ? 0 : 10; // Prioritize imminent tasks

    if (task.priority === 'P0' && task.status === 'Yet to Start') return baseScore + 0;
    if (task.priority === 'P0' && task.status === 'WIP') return baseScore + 1;
    if (task.priority === 'P1' && task.status === 'Yet to Start') return baseScore + 2;
    if (task.priority === 'P1' && task.status === 'WIP') return baseScore + 3;
    if (task.status === 'In Review') return baseScore + 4;
    
    return baseScore + 5 + priorityOrder[task.priority];
};


export function FocusRecommendation({ tasks, onTaskUpdate }: FocusRecommendationProps) {
  const recommendedTasks = useMemo(() => {
    const activeTasks = tasks.filter(task => task.status !== 'Done');
    
    return activeTasks.sort((a, b) => {
        const scoreA = getTaskSortScore(a);
        const scoreB = getTaskSortScore(b);

        if (scoreA !== scoreB) {
            return scoreA - scoreB;
        }

        // If scores are the same, use due date as a tie-breaker
        const aDueDate = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
        const bDueDate = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
        return aDueDate.getTime() - bDueDate.getTime();

    }).slice(0, 3);
  }, [tasks]);

  return (
    <Card className="bg-primary/10 border-primary/40 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Focus Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <ScrollArea className="h-[124px]">
            {recommendedTasks.length > 0 ? (
                <div className="space-y-1">
                {recommendedTasks.map(task => (
                    <TaskDialog
                    key={task.id}
                    task={task}
                    onSave={onTaskUpdate}
                    trigger={
                        <div className="group cursor-pointer rounded-md p-2 hover:bg-primary/20">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold truncate pr-4 group-hover:text-primary">{task.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground flex-shrink-0">
                                    <div className="flex items-center gap-1">
                                        <PriorityIcon priority={task.priority} className="h-4 w-4" />
                                        <span>{getPriorityLabel(task.priority)}</span>
                                    </div>
                                    <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                                </div>
                            </div>
                        </div>
                    }
                    />
                ))}
                </div>
            ) : (
                <div className="flex h-[124px] items-center justify-center">
                    <p className="text-muted-foreground">All tasks are done! Great job!</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
