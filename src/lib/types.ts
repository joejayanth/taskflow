export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type Status = 'Yet to Start' | 'WIP' | 'In Review' | 'Done';

export type StatusUpdate = {
  status: Status;
  timestamp: string; // ISO 8601 date string
};

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // ISO 8601 date string
  status: Status;
  history: StatusUpdate[];
}
