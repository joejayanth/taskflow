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

interface FocusRecommendationProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
}

const priorityOrder: Record<Priority, number> = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };

const isBusinessDay = (date: Date) => {
  const day = getDay(date);
  return day !== 0 && day !== 6;
};

const getNextTwoBusinessDays = () => {
    let businessDays: Date[] = [];
    let date = addDays(new Date(), 1);

    while(businessDays.length < 2) {
        if(isBusinessDay(date)) {
            businessDays.push(date);
        }
        date = addDays(date, 1);
    }
    return businessDays;
}

const isDueSoon = (dueDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) return true;
  if (isToday(due)) return true;

  const nextTwoBusinessDays = getNextTwoBusinessDays();
  const nextBizDay1 = nextTwoBusinessDays[0];
  nextBizDay1.setHours(0,0,0,0);
  const nextBizDay2 = nextTwoBusinessDays[1];
  nextBizDay2.setHours(0,0,0,0);
  
  return due.getTime() === nextBizDay1.getTime() || due.getTime() === nextBizDay2.getTime();
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
    <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden rounded-xl">
      <CardHeader className="py-3 px-4 bg-primary/10 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
          <Zap className="h-4 w-4 fill-primary" />
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
                        <div className="group cursor-pointer rounded-lg p-2.5 transition-colors hover:bg-primary/10">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-[14px] font-bold truncate flex-1 group-hover:text-primary">{task.title}</h3>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                                        <PriorityIcon priority={task.priority} className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline-block">Due {format(new Date(task.dueDate), "MMM d")}</span>
                                    </div>
                                    <Badge variant="outline" className="h-5 text-[10px] font-bold uppercase tracking-wider bg-background/50 border-none px-2">{task.status}</Badge>
                                </div>
                            </div>
                        </div>
                    }
                    />
                ))}
                </div>
            ) : (
                <div className="flex h-[136px] items-center justify-center px-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground/60">Your focus list is clear. Ready for new challenges?</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}