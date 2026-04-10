"use client";

import type { Task } from "@/lib/types";
import { CheckCircle2, Clock, AlertTriangle, LayoutList } from "lucide-react";
import { isPast, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'WIP').length;
  const today = startOfDay(new Date());
  const overdue = tasks.filter(t => {
    if (t.status === 'Done') return false;
    const due = startOfDay(new Date(t.dueDate));
    return due.getTime() < today.getTime();
  }).length;
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    {
      icon: LayoutList,
      label: 'Total Tasks',
      value: String(total),
      subtext: null as string | null,
      colorClass: 'text-foreground',
      iconBg: 'bg-muted/60',
      cardBg: 'bg-muted/30 border-border/50',
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: String(done),
      subtext: `${completionPct}%`,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950',
      cardBg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900/50',
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: String(inProgress),
      subtext: null,
      colorClass: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-100 dark:bg-violet-950',
      cardBg: 'bg-violet-50/80 dark:bg-violet-950/30 border-violet-200/50 dark:border-violet-900/50',
    },
    {
      icon: AlertTriangle,
      label: 'Overdue',
      value: String(overdue),
      subtext: null,
      colorClass: overdue > 0 ? 'text-destructive' : 'text-muted-foreground',
      iconBg: overdue > 0 ? 'bg-red-100 dark:bg-red-950' : 'bg-muted/60',
      cardBg: overdue > 0
        ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200/50 dark:border-red-900/50'
        : 'bg-muted/30 border-border/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, subtext, colorClass, iconBg, cardBg }) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
            cardBg
          )}
        >
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
            <Icon className={cn("h-4 w-4", colorClass)} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <p className={cn("text-xl font-bold leading-none mt-0.5", colorClass)}>{value}</p>
              {subtext && (
                <span className={cn("text-xs font-semibold opacity-70", colorClass)}>{subtext}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
