import { cn } from '../../lib/utils';
import type { EmergencyType, EmergencyStatus, EmergencyLevel } from '../../types';

const typeLabels: Record<EmergencyType, string> = {
  snake_bite: 'Snake Bite',
  animal_attack: 'Animal Attack',
  landslide: 'Landslide',
  flood: 'Flood',
  fire: 'Fire',
  earthquake: 'Earthquake',
  fracture: 'Fracture',
  heavy_bleeding: 'Heavy Bleeding',
  heart_attack: 'Heart Attack',
  lost_in_forest: 'Lost in Forest',
  breathing_problem: 'Breathing Problem',
  accident: 'Accident',
};

const typeIcons: Record<EmergencyType, string> = {
  snake_bite: '🐍', animal_attack: '🐾', landslide: '⛰️', flood: '🌊',
  fire: '🔥', earthquake: '🌍', fracture: '🦴', heavy_bleeding: '🩸',
  heart_attack: '❤️', lost_in_forest: '🌲', breathing_problem: '💨', accident: '🚗',
};

export function TypeBadge({ type }: { type: EmergencyType }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-800/40 text-slate-300 border border-slate-700/60 font-medium">
      <span>{typeIcons[type]}</span>
      <span>{typeLabels[type]}</span>
    </span>
  );
}

export function LevelBadge({ level }: { level: EmergencyLevel }) {
  const colors = {
    1: 'bg-[#10B981]/6 text-[#10B981] border-[#10B981]/15',
    2: 'bg-[#F59E0B]/6 text-[#F59E0B] border-[#F59E0B]/15',
    3: 'bg-[#FF3B30]/6 text-[#FF3B30] border-[#FF3B30]/15',
  };
  const labels = { 1: 'Minor', 2: 'Medical', 3: 'Critical' };
  return (
    <span className={cn('text-xs px-2.5 py-1 rounded-lg border font-mono font-semibold tracking-wide', colors[level])}>
      L{level} · {labels[level]}
    </span>
  );
}

export function StatusBadge({ status }: { status: EmergencyStatus }) {
  const styles = {
    active: 'bg-[#FF3B30]/6 text-[#FF3B30] border-[#FF3B30]/15',
    assigned: 'bg-[#F59E0B]/6 text-[#F59E0B] border-[#F59E0B]/15',
    resolved: 'bg-[#10B981]/6 text-[#10B981] border-[#10B981]/15',
    cancelled: 'bg-slate-500/10 text-slate-400 border-slate-600/15',
  };
  return (
    <span className={cn('text-[11px] px-2.5 py-1 rounded-lg border font-mono font-bold uppercase tracking-wider', styles[status])}>
      {status}
    </span>
  );
}
