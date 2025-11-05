import type { Task } from './types';

const now = new Date();

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design the new landing page',
    description: 'Create a Figma mockup for the new marketing landing page, focusing on conversion and user experience.',
    status: 'WIP',
    priority: 'P1',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
    history: [{ status: 'Yet to Start', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }, { status: 'WIP', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) }],
  },
  {
    id: 'task-2',
    title: 'Implement authentication API',
    description: 'Set up Passport.js with JWT for user authentication. Endpoints needed: /login, /register, /logout.',
    status: 'In Review',
    priority: 'P0',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    history: [{ status: 'Yet to Start', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }, { status: 'WIP', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }, { status: 'In Review', timestamp: new Date() }],
  },
  {
    id: 'task-3',
    title: 'Write documentation for the new feature',
    description: 'Document the new "Task Import" feature for both end-users and developers.',
    status: 'Yet to Start',
    priority: 'P2',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
    history: [{ status: 'Yet to Start', timestamp: new Date() }],
  },
  {
    id: 'task-4',
    title: 'Fix bug in reporting module',
    description: 'The monthly report generation is failing for users with more than 1000 tasks.',
    status: 'Yet to Start',
    priority: 'P0',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    history: [{ status: 'Yet to Start', timestamp: new Date() }],
  },
  {
    id: 'task-5',
    title: 'Deploy staging environment updates',
    description: 'Merge the `develop` branch into `staging` and deploy to the server.',
    status: 'Done',
    priority: 'P1',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    history: [{ status: 'Yet to Start', timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) }, { status: 'WIP', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }, { status: 'Done', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }],
  },
   {
    id: 'task-6',
    title: 'Research new charting libraries',
    description: 'Evaluate Tremor, Recharts, and Nivo for our new dashboard.',
    status: 'WIP',
    priority: 'P3',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
    history: [{ status: 'Yet to Start', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) }, { status: 'WIP', timestamp: new Date() }],
  },
];
