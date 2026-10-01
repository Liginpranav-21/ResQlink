import { useState, useMemo } from 'react';
import type { Emergency, FleetUnit, RescueTeam } from '@resqlink/shared';
import { Bot, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

interface ResQAICommandAssistantProps {
  emergencies: Emergency[];
  ambulances: FleetUnit[];
  rescueTeams: RescueTeam[];
  onFocusEmergency?: (id: string) => void;
}

export default function ResQAICommandAssistant({
  emergencies,
  ambulances,
  rescueTeams,
  onFocusEmergency,
}: ResQAICommandAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Compute live situational summary from actual store/RTDB data
  const summary = useMemo(() => {
    const active = emergencies.filter((e) => e.status !== 'resolved' && e.status !== 'cancelled');
    const critical = active.filter((e) => e.level >= 3);
    const availableAmb = ambulances.filter((a) => a.status === 'available' || !a.status);
    const availableTeams = rescueTeams.filter((t) => t.status === 'available' || !t.status);

    const topPriority = critical.length > 0 ? critical[0] : active.length > 0 ? active[0] : null;

    return {
      activeCount: active.length,
      criticalCount: critical.length,
      availableAmbCount: availableAmb.length,
      availableTeamsCount: availableTeams.length,
      topPriority,
    };
  }, [emergencies, ambulances, rescueTeams]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden h-full">
      {/* Glow highlight background effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB]">
              <Bot size={15} />
            </div>
            <div>
              <h2 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
                ResQAI Command Assistant
              </h2>
              <p className="text-slate-400 text-[11px]">Live Situational Intelligence</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-400 font-mono">
            Deterministic Engine
          </span>
        </div>

        {/* Live Analysis Output */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-300 font-medium border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#F59E0B]" /> Situation Analysis
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              {summary.activeCount} active incident{summary.activeCount === 1 ? '' : 's'}
            </span>
          </div>

          <p className="text-slate-400 leading-relaxed text-[11px]">
            {summary.activeCount === 0 ? (
              'All incident queues clear. Operational readiness is at 100% across all response sectors.'
            ) : (
              <>
                Detected <strong className="text-white font-semibold">{summary.activeCount} active emergency triggers</strong>.
                {summary.criticalCount > 0 && (
                  <> <strong className="text-[#FF3B30] font-semibold">{summary.criticalCount} require Level-3 critical attention</strong>.</>
                )}
                {' '}{summary.availableAmbCount} ambulances and {summary.availableTeamsCount} rescue teams currently available for dispatch.
              </>
            )}
          </p>

          {summary.topPriority && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <p className="text-[#FF3B30] font-semibold text-[11px] uppercase tracking-wider font-mono flex items-center gap-1">
                <ShieldAlert size={12} /> Top Dispatch Priority:
              </p>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div>
                  <p className="text-white font-semibold text-xs">{summary.topPriority.userName || 'Victim'}</p>
                  <p className="text-slate-400 text-[10px] font-mono">
                    {summary.topPriority.type?.replace(/_/g, ' ')} · L{summary.topPriority.level}
                  </p>
                </div>
                {onFocusEmergency && (
                  <button
                    onClick={() => onFocusEmergency(summary.topPriority!.id)}
                    className="p-1.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] rounded-lg transition-colors"
                    title="Focus Incident"
                  >
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trigger Button */}
      <div className="mt-4">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
        >
          <Sparkles size={13} className={isAnalyzing ? 'animate-spin text-[#F59E0B]' : 'text-[#F59E0B]'} />
          {isAnalyzing ? 'Evaluating Telemetry...' : 'RE-ANALYZE SITUATION'}
        </button>
      </div>
    </div>
  );
}
