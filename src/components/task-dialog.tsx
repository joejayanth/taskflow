
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, History, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, Status, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { getPriorityLabel } from './priority-icon';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  dueDate: z.date({ required_error: 'A due date is required.' }),
  status: z.enum(['Yet to Start', 'WIP', 'In Review', 'Done']),
  category: z.enum(['work', 'personal']).default('work'),
  blocked: z.boolean().default(false),
  reminderDate: z.date().optional(),
});

interface TaskDialogProps {
  task?: Task;
  trigger: React.ReactNode;
  onSave: (task: Task) => void;
  onDelete?: (task: Task) => void;
  initialStatus?: Status;
  initialCategory?: Category;
}

const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return <div className="break-all">{text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    })}</div>;
};

export function TaskDialog({ task, trigger, onSave, onDelete, initialStatus, initialCategory }: TaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(!task);

  const isNewTask = !task;

  useEffect(() => {
    if (isOpen) {
      setIsEditing(isNewTask);
    }
  }, [isOpen, isNewTask]);


  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'P2',
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      status: initialStatus || task?.status || 'Yet to Start',
      category: initialCategory || task?.category || 'work',
      blocked: task?.blocked || false,
      reminderDate: task?.reminderDate ? new Date(task.reminderDate) : undefined,
    },
  });

   useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: new Date(task.dueDate),
        status: task.status,
        category: task.category,
        blocked: task.blocked || false,
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : undefined,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        priority: 'P2',
        dueDate: new Date(),
        status: initialStatus || 'Yet to Start',
        category: initialCategory || 'work',
        blocked: false,
        reminderDate: undefined,
      });
    }
  }, [task, form, initialStatus, initialCategory]);

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    const newOrUpdatedTask: Task = {
      id: task?.id || crypto.randomUUID(),
      ...values,
      blocked: values.blocked || false,
      category: values.category as Category,
      dueDate: values.dueDate,
      reminderDate: values.reminderDate,
      history: task ? (task.status !== values.status ? [...task.history, {status: values.status, timestamp: new Date()}] : task.history) : [{status: values.status, timestamp: new Date()}],
    };
    onSave(newOrUpdatedTask);
    setIsOpen(false);
  };
  
  const handleDelete = () => {
    if (task && onDelete) {
        onDelete(task);
        setIsOpen(false);
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsEditing(isNewTask);
       form.reset(isNewTask ? {
        title: '',
        description: '',
        priority: 'P2',
        dueDate: new Date(),
        status: initialStatus || 'Yet to Start',
        category: initialCategory || 'work',
        blocked: false,
        reminderDate: undefined,
      } : {
        title: task?.title,
        description: task?.description,
        priority: task?.priority,
        dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
        status: task?.status,
        category: task?.category,
        blocked: task?.blocked || false,
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : undefined,
      });
    }
  }

  const handleCancel = () => {
    if (isNewTask) {
      setIsOpen(false);
    } else {
      setIsEditing(false);
      form.reset({
        title: task?.title,
        description: task?.description,
        priority: task?.priority,
        dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
        status: task?.status,
        category: task?.category,
        blocked: task?.blocked || false,
        reminderDate: task?.reminderDate ? new Date(task.reminderDate) : undefined,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent 
        className="sm:max-w-[625px] grid-rows-[auto,1fr,auto] p-0 max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-rows-[auto,1fr,auto] h-full max-h-[90vh]">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>
                {isEditing ? (
                  <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Task Title" {...field} className="text-2xl font-bold border-0 shadow-none px-0 h-auto focus-visible:ring-0" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                ) : (
                  <div className="flex items-center justify-between pr-8">
                     <span className="text-2xl">{task?.title}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                          <Pencil className="h-5 w-5" />
                      </Button>
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 overflow-y-auto px-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Category</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            {field.value === 'work' ? 'Work' : 'Personal'}
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value === 'personal'}
                                            onCheckedChange={(checked) => field.onChange(checked ? 'personal' : 'work')}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="blocked"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Blocked</FormLabel>
                                         <p className="text-sm text-muted-foreground">
                                            {field.value ? 'Yes' : 'No'}
                                         </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                      <FormField
                        control={form.control}
                        name="reminderDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reminder Date</FormLabel>
                            <div className="flex items-center gap-2">
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
                                        <span>Set a reminder</span>
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
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => field.onChange(undefined)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                 ) : (
                    <>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[60px]">
                            {task?.description ? linkify(task.description) : 'No description provided.'}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div><span className="font-semibold">Status:</span> {task?.status}</div>
                            <div><span className="font-semibold">Priority:</span> {getPriorityLabel(task?.priority)}</div>
                            <div><span className="font-semibold">Due:</span> {task && format(new Date(task.dueDate), 'PPP')}</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                             <div><span className="font-semibold">Category:</span> <span className="capitalize">{task?.category}</span></div>
                             {task?.blocked && (
                                <div className="font-semibold text-destructive">
                                    This task is blocked.
                                </div>
                            )}
                        </div>

                        {task?.reminderDate && (
                            <div className="text-sm">
                                <span className="font-semibold">Reminder:</span> {format(new Date(task.reminderDate), 'PPP')}
                            </div>
                        )}
                    </>
                 )}
            
                {task && (
                    <div className="space-y-2 pt-2">
                        <h4 className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4"/> Status History</h4>
                        <Separator />
                        <ul className="space-y-1 text-xs text-muted-foreground max-h-24 overflow-y-auto">
                            {task.history.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((h, i) => (
                                <li key={i}>{format(new Date(h.timestamp), 'MMM d, yyyy, h:mm a')}: Status changed to <strong>{h.status}</strong></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <DialogFooter className="p-6 pt-4 flex justify-between">
                <div>
                {!isNewTask && isEditing && onDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" className="mr-auto">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this task.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                </div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                ) : <div className="h-10"></div>}
          </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    