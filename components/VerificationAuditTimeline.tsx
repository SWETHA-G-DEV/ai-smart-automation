import React from 'react';
import { AuditLogEntry } from '../types';
import { Clock, CheckCircle2, AlertTriangle, Info, ShieldAlert, User, ShieldCheck } from 'lucide-react';

interface VerificationAuditTimelineProps {
  logs?: AuditLogEntry[];
  auditTrail?: AuditLogEntry[];
}

export const VerificationAuditTimeline: React.FC<VerificationAuditTimelineProps> = ({
  logs: passedLogs,
  auditTrail,
}) => {
  const logs = passedLogs || auditTrail || [];
  const getBadge = (type: AuditLogEntry['badgeType']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          bg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          bg: 'bg-amber-100 border-amber-300 text-amber-800',
          dot: 'bg-amber-500',
        };
      case 'danger':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
          bg: 'bg-rose-100 border-rose-300 text-rose-800',
          dot: 'bg-rose-500',
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-blue-600" />,
          bg: 'bg-blue-100 border-blue-300 text-blue-800',
          dot: 'bg-blue-500',
        };
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
        No verification events recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Application Audit History &amp; Decision Log</span>
        </h4>
        <span className="text-[11px] font-mono text-slate-400">{logs.length} logged events</span>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-5 py-1">
        {logs.map((log) => {
          const badge = getBadge(log.badgeType);
          return (
            <div key={log.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${badge.dot}`}
              ></div>

              <div className="bg-slate-50 hover:bg-slate-100/80 transition p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{log.action}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                      {log.actor}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
