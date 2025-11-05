
"use client";

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
            <div className="space-y-1">
            {tasks.map(task => (
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
      </CardContent>
    </Card>
  );
}
