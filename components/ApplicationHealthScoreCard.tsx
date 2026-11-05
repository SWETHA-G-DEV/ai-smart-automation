import React from 'react';
import { ApplicationHealth, Student, UploadedDocument } from '../types';
import { calculateApplicationHealth } from '../utils/healthCheck';
import { Activity, CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ApplicationHealthScoreCardProps {
  health?: ApplicationHealth;
  student?: Student;
  documents?: UploadedDocument[];
  onOpenChecklist?: () => void;
}

export const ApplicationHealthScoreCard: React.FC<ApplicationHealthScoreCardProps> = ({
  health: passedHealth,
  student,
  documents,
  onOpenChecklist,
}) => {
  const health = passedHealth || (student && documents ? calculateApplicationHealth(student, documents) : null);

  if (!health) return null;

  const getRatingColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', ring: 'text-emerald-500' };
    if (score >= 70) return { bg: 'bg-blue-50 text-blue-800 border-blue-300', ring: 'text-blue-500' };
    if (score >= 50) return { bg: 'bg-amber-50 text-amber-800 border-amber-300', ring: 'text-amber-500' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-300', ring: 'text-rose-500' };
  };

  const currentStyle = getRatingColor(health.totalScore);
  const pendingItems = health.checklist.filter((item) => !item.isPassed);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Application Health &amp; Readiness</h3>
            <p className="text-[11px] text-slate-500">Pre-scrutiny completeness evaluation</p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentStyle.bg}`}>
          {health.rating}
        </span>
      </div>

      {/* Main Score and Meter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 flex items-center gap-3">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {health.totalScore}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </div>
          <div className="text-xs text-slate-500 leading-snug">
            {health.totalScore >= 90
              ? 'Excellent! Application is clean and ready for immediate teacher sign-off.'
              : health.totalScore >= 70
              ? 'Good shape. A couple of recommended fixes will elevate your score to 100%.'
              : 'Action required before counseling committee deadline.'}
          </div>
        </div>

        {/* Category Breakdown Bar */}
        <div className="md:col-span-7 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Completeness Breakdown</span>
            <span>{health.checklist.filter((c) => c.isPassed).length} of {health.checklist.length} verified</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
            <div
              style={{ width: `${(health.breakdown.profileScore / 20) * 20}%` }}
              className="bg-blue-600 h-full"
              title={`Profile: ${health.breakdown.profileScore}/20`}
            ></div>
            <div
              style={{ width: `${(health.breakdown.docsScore / 25) * 25}%` }}
              className="bg-indigo-600 h-full"
              title={`Documents: ${health.breakdown.docsScore}/25`}
            ></div>
            <div
              style={{ width: `${(health.breakdown.marksScore / 20) * 20}%` }}
              className="bg-emerald-500 h-full"
              title={`Marks: ${health.breakdown.marksScore}/20`}
            ></div>
            <div
              style={{ width: `${(health.breakdown.photoScore / 15) * 15}%` }}
              className="bg-purple-500 h-full"
              title={`Photo: ${health.breakdown.photoScore}/15`}
            ></div>
            <div
              style={{ width: `${(health.breakdown.crossDocScore / 20) * 20}%` }}
              className="bg-cyan-500 h-full"
              title={`CrossDoc: ${health.breakdown.crossDocScore}/20`}
            ></div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Profile ({health.breakdown.profileScore}/20)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Docs ({health.breakdown.docsScore}/25)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Marks ({health.breakdown.marksScore}/20)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Photo ({health.breakdown.photoScore}/15)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Identity ({health.breakdown.crossDocScore}/20)
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Improvement Tips */}
      {pendingItems.length > 0 ? (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>How to reach 100% Score ({pendingItems.length} improvement items remaining):</span>
          </div>
          <ul className="space-y-1 text-slate-700 pl-4 list-disc text-xs">
            {pendingItems.slice(0, 3).map((item) => (
              <li key={item.id}>
                <strong>{item.label}:</strong> {item.fixHint}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            All pre-submission checks passed with 100% completeness score!
          </span>
        </div>
      )}
    </div>
  );
};
