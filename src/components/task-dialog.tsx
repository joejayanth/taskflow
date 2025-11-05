"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, History, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, Priority, Status } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from './ui/separator';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  dueDate: z.date({ required_error: 'A due date is required.' }),
  status: z.enum(['Yet to Start', 'WIP', 'In Review', 'Done']),
});

interface TaskDialogProps {
  task?: Task;
  trigger: React.ReactNode;
  onSave: (task: Task) => void;
}

export function TaskDialog({ task, trigger, onSave }: TaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(!task);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'P2',
      dueDate: task?.dueDate || new Date(),
      status: task?.status || 'Yet to Start',
    },
  });

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    const newOrUpdatedTask: Task = {
      id: task?.id || crypto.randomUUID(),
      ...values,
      history: task ? (task.status !== values.status ? [...task.history, {status: values.status, timestamp: new Date()}] : task.history) : [{status: values.status, timestamp: new Date()}],
    };
    onSave(newOrUpdatedTask);
    setIsEditing(false);
    setIsOpen(false);
    if (!task) {
      form.reset({
        title: '',
        description: '',
        priority: 'P2',
        dueDate: new Date(),
        status: 'Yet to Start',
      });
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsEditing(!task); // Reset editing state on close
      form.reset(task ? {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        status: task.status,
      } : {
        title: '',
        description: '',
        priority: 'P2',
        dueDate: new Date(),
        status: 'Yet to Start',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              {isEditing ? (
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                            <Input placeholder="Task Title" {...field} className="text-lg font-bold border-0 shadow-none px-0 focus-visible:ring-0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              ) : (
                <DialogTitle className="flex items-center justify-between">
                    <span className="text-2xl">{task?.title}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-5 w-5" />
                    </Button>
                </DialogTitle>
              )}
            </DialogHeader>
            
            <div className="space-y-4">
                 {isEditing ? (
                    <>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add a more detailed description..."
                              className="resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Yet to Start">Yet to Start</SelectItem>
                                  <SelectItem value="WIP">WIP</SelectItem>
                                  <SelectItem value="In Review">In Review</SelectItem>
                                  <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="P0">Urgent</SelectItem>
                                  <SelectItem value="P1">High</SelectItem>
                                  <SelectItem value="P2">Medium</SelectItem>
                                  <SelectItem value="P3">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={'outline'}
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !field.value && 'text-muted-foreground'
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, 'PPP')
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date('1900-01-01')}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    </>
                 ) : (
                    <>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task?.description || 'No description provided.'}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div><span className="font-semibold">Status:</span> {task?.status}</div>
                            <div><span className="font-semibold">Priority:</span> {task?.priority}</div>
                            <div><span className="font-semibold">Due:</span> {task && format(task.dueDate, 'PPP')}</div>
                        </div>
                    </>
                 )}
            </div>
            
            {task && (
                <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4"/> Status History</h4>
                    <Separator />
                    <ul className="space-y-1 text-xs text-muted-foreground">
                        {task.history.map((h, i) => (
                            <li key={i}>{format(h.timestamp, 'MMM d, yyyy, h:mm a')}: Status changed to <strong>{h.status}</strong></li>
                        ))}
                    </ul>
                </div>
            )}

            {isEditing && (
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
