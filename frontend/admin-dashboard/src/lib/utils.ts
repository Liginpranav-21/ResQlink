import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function getLevelColor(level: number): string {
  if (level === 3) return 'text-red-400 bg-red-400/10 border-red-400/30';
  if (level === 2) return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  return 'text-green-400 bg-green-400/10 border-green-400/30';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-red-400 bg-red-400/10';
    case 'assigned': return 'text-amber-400 bg-amber-400/10';
    case 'resolved': return 'text-green-400 bg-green-400/10';
    case 'cancelled': return 'text-slate-400 bg-slate-400/10';
    default: return 'text-slate-400 bg-slate-400/10';
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}
