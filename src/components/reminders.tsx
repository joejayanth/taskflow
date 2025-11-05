
"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types";
import { BellRing, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { TaskDialog } from "./task-dialog";
import { ScrollArea } from "./ui/scroll-area";

interface RemindersProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

export function Reminders({ tasks, onTaskUpdate }: RemindersProps) {
  const reminderTasks = useMemo(() => {
    const today = new Date();
    // Set time to 00:00:00 to compare dates only
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      if (task.status === 'Done' || !task.reminderDate) {
        return false;
      }
      const reminderDate = new Date(task.reminderDate);
      reminderDate.setHours(0, 0, 0, 0);
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      // Show reminder if today's date is on or after the reminder date, 
      // and before the due date.
      const shouldRemind = reminderDate.getTime() <= today.getTime() && today.getTime() < dueDate.getTime();

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
        {reminderTasks.length > 0 ? (
            <ScrollArea className="h-[124px]">
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
            </ScrollArea>
        ) : (
            <div className="flex items-center justify-center text-sm text-muted-foreground h-[124px]">
                <p>No active reminders.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
