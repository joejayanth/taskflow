import type { Priority } from '@/lib/types';
import { Flame, ChevronUp, Minus, ChevronDown, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig: Record<Priority, { Icon: React.ElementType; style: React.CSSProperties; label: string }> = {
  P0: { Icon: Flame, style: { color: 'hsl(var(--destructive))' }, label: 'Urgent' },
  P1: { Icon: ChevronUp, style: { color: 'hsl(var(--chart-1))' }, label: 'High' },
  P2: { Icon: Minus, style: { color: 'hsl(var(--chart-4))' }, label: 'Medium' },
  P3: { Icon: ChevronDown, style: { color: 'hsl(var(--muted-foreground))' }, label: 'Low' },
};

export function PriorityIcon({ priority, className, ...props }: { priority: Priority } & LucideProps) {
  const { Icon, style } = priorityConfig[priority];
  return <Icon style={style} className={cn(className)} {...props} />;
}

export const getPriorityLabel = (priority: Priority) => priorityConfig[priority].label;
