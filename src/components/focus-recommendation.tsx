
"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityIcon, getPriorityLabel } from "./priority-icon";
import { format } from "date-fns";
import { TaskDialog } from "./task-dialog";
import { ScrollArea } from "./ui/scroll-area";

interface FocusRecommendationProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };

export function FocusRecommendation({ tasks, onTaskUpdate }: FocusRecommendationProps) {
  const recommendedTasks = useMemo(() => {
    const activeTasks = tasks.filter(task => task.status !== 'Done');
    if (activeTasks.length === 0) return [];

    return activeTasks.sort((a, b) => {
      // Sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date (earlier first)
      const aDueDate = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
      const bDueDate = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
      return aDueDate.getTime() - bDueDate.getTime();
    }).slice(0, 3);
  }, [tasks]);

  return (
    <Card className="bg-primary/10 border-primary/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Focus Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40">
            {recommendedTasks.length > 0 ? (
                <div className="space-y-3">
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
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">All tasks are done! Great job!</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
