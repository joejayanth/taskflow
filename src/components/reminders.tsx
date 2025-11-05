
"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types";
import { BellRing, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isAfter, isBefore, startOfToday, isEqual } from "date-fns";
import { TaskDialog } from "./task-dialog";
import { ScrollArea } from "./ui/scroll-area";

interface RemindersProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

export function Reminders({ tasks, onTaskUpdate }: RemindersProps) {
  const reminderTasks = useMemo(() => {
    const today = startOfToday();
    return tasks.filter(task => {
      if (task.status === 'Done' || !task.reminderDate) {
        return false;
      }
      const reminderDate = startOfToday(new Date(task.reminderDate));
      const dueDate = startOfToday(new Date(task.dueDate));
      
      const shouldRemind = (isAfter(today, reminderDate) || isEqual(today, reminderDate)) && isBefore(today, dueDate);

      return shouldRemind;
    });
  }, [tasks]);

  return (
    <Card className="bg-accent/20 border-accent/40 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="h-5 w-5 text-accent-foreground" />
          <span>Reminders</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <ScrollArea className="h-[124px]">
          {reminderTasks.length > 0 ? (
            <div className="space-y-1">
              {reminderTasks.map(task => (
                <TaskDialog
                  key={task.id}
                  task={task}
                  onSave={onTaskUpdate}
                  trigger={
                    <div className="group cursor-pointer rounded-md p-2 hover:bg-accent/40">
                      <p className="font-semibold group-hover:text-primary truncate pr-4">{task.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarClock className="h-4 w-4" />
                        <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No active reminders.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
