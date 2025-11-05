export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type Status = 'Yet to Start' | 'WIP' | 'In Review' | 'Done';

export type StatusUpdate = {
  status: Status;
  timestamp: Date;
};

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date;
  status: Status;
  history: StatusUpdate[];
  blocked?: boolean;
}
