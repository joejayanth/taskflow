
"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { MoreVertical, Trash2, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DoneColumnActionsProps {
  tasks: Task[];
  onDeleteAll: (tasks: Task[]) => void;
}

export function DoneColumnActions({ tasks, onDeleteAll }: DoneColumnActionsProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleExport = () => {
        if (tasks.length === 0) return;

        const headers = ["Title", "Description", "Priority", "Date Moved to Done"];
        const rows = tasks.map(task => {
            const doneHistory = task.history.find(h => h.status === 'Done');
            const doneDate = doneHistory ? format(new Date(doneHistory.timestamp), 'yyyy-MM-dd HH:mm:ss') : '';
            return [
                `"${task.title.replace(/"/g, '""')}"`,
                `"${task.description.replace(/"/g, '""')}"`,
                task.priority,
                doneDate
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "done_tasks.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteClick = () => {
        if (tasks.length > 0) {
            setIsDeleteDialogOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        onDeleteAll(tasks);
        setIsDeleteDialogOpen(false);
    };


  return (
    <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport} disabled={tasks.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} disabled={tasks.length === 0} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete all
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all {tasks.length} tasks in the "Done" column.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
