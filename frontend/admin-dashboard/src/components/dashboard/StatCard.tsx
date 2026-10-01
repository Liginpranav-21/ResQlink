import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  color: 'red' | 'amber' | 'green' | 'blue' | 'purple';
  icon: LucideIcon;
  pulse?: boolean;
}

const colorMap = {
  red: 'border-[#FF3B30]/20 bg-[#FF3B30]/[0.04]',
  amber: 'border-[#F59E0B]/20 bg-[#F59E0B]/[0.04]',
  green: 'border-[#10B981]/20 bg-[#10B981]/[0.04]',
  blue: 'border-[#2563EB]/20 bg-[#2563EB]/[0.04]',
  purple: 'border-[#818CF8]/20 bg-[#818CF8]/[0.04]',
};
const valueColorMap = {
  red: 'text-[#FF3B30]',
  amber: 'text-[#F59E0B]',
  green: 'text-[#10B981]',
  blue: 'text-[#2563EB]',
  purple: 'text-[#818CF8]',
};
const hudMap = {
  red: 'hud-frame--critical',
  amber: '',
  green: 'hud-frame--success',
  blue: '',
  purple: '',
};

export default function StatCard({ title, value, subtitle, trend, color, icon: Icon, pulse }: StatCardProps) {
  return (
    <div className={cn('hud-frame rounded-2xl border p-5 relative overflow-hidden transition-all hover:-translate-y-0.5', colorMap[color], hudMap[color])}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="label-tactical text-slate-400 mb-2">{title}</p>
          <p className={cn('text-3xl font-mono font-bold tracking-tight', valueColorMap[color])}>
            {value}
            {pulse && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse align-middle" />
            )}
          </p>
          {subtitle && <p className="text-slate-500 text-xs mt-1.5">{subtitle}</p>}
        </div>
        <Icon size={20} strokeWidth={1.75} className={cn('opacity-70 shrink-0', valueColorMap[color])} />
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center">
          <span className={cn('text-xs font-mono font-semibold', trend.value >= 0 ? 'text-[#10B981]' : 'text-[#FF3B30]')}>
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500 text-xs ml-1.5">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
