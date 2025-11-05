
"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityIcon, getPriorityLabel } from "./priority-icon";
import { format } from "date-fns";
import { TaskDialog } from "./task-dialog";

interface FocusRecommendationProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };

export function FocusRecommendation({ tasks, onTaskUpdate }: FocusRecommendationProps) {
  const recommendedTask = useMemo(() => {
    const activeTasks = tasks.filter(task => task.status !== 'Done');
    if (activeTasks.length === 0) return null;

    return activeTasks.sort((a, b) => {
      // Sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date (earlier first)
      const aDueDate = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
      const bDueDate = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
      return aDueDate.getTime() - bDueDate.getTime();
    })[0];
  }, [tasks]);

  if (!recommendedTask) {
    return (
      <Card className="bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span>Focus Recommendation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">All tasks are done! Great job!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TaskDialog
      task={recommendedTask}
      onSave={onTaskUpdate}
      trigger={
        <Card className="bg-primary/10 border-primary/40 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>Next Task to Focus On</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold truncate pr-4">{recommendedTask.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground flex-shrink-0">
                  <div className="flex items-center gap-1">
                      <PriorityIcon priority={recommendedTask.priority} className="h-4 w-4" />
                      <span>{getPriorityLabel(recommendedTask.priority)}</span>
                  </div>
                  <span>Due: {format(new Date(recommendedTask.dueDate), "MMM d, yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
