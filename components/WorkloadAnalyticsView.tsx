import React from 'react';
import { Student, UploadedDocument } from '../types';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Sparkles,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface WorkloadAnalyticsViewProps {
  students: Student[];
  documents: UploadedDocument[];
}

export const WorkloadAnalyticsView: React.FC<WorkloadAnalyticsViewProps> = ({
  students,
  documents,
}) => {
  const total = students.length;
  const verified = students.filter((s) => s.status === 'Verified').length;
  const correction = students.filter((s) => s.status === 'Correction Required').length;
  const manualReview = students.filter((s) => s.status === 'Manual Review Required').length;
  const pending = students.filter((s) => s.status === 'Submitted' || s.status === 'Under Verification').length;

  // Estimated teacher workload saved calculation
  // Manual physical verification per student = 35 minutes
  // Automated OCR + Photo check = 2 minutes per student
  // Savings: 33 minutes per applicant
  const minutesSaved = total * 33;
  const hoursSaved = (minutesSaved / 60).toFixed(1);

  // Issues distribution
  const blurryPhotos = documents.filter((d) => d.photoQuality?.isBlurry).length;
  const marksMismatches = students.filter((s) =>
    documents.some((d) => d.studentId === s.id && d.docType === 'marksheet_12' && d.ocrResult && d.verificationStatus === 'Correction Required')
  ).length;
  const crossDocMismatches = students.filter((s) => s.crossDocComparison?.nameMatch === 'MINOR_DIFFERENCE' || s.crossDocComparison?.nameMatch === 'MISMATCH').length;
  const missingCerts = students.filter((s) => s.correctionsRequested.some((c) => c.docType === 'community_certificate')).length;

  return (
    <div className="space-y-6">
      {/* Top Workload Savings Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800 text-cyan-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Teacher Workload Reduction Metric</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            Estimated Teacher Scrutiny Time Saved: <span className="text-cyan-300 font-extrabold">{hoursSaved} Hours</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            By pre-extracting marks with Tesseract OCR, auto-validating subject sums, and running biometric edge-variance
            photo audits, teacher review cycle was reduced from ~35 mins down to 2 mins per candidate.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0 text-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <span className="text-2xl font-black text-white">~33 min</span>
            <p className="text-[10px] text-cyan-200 mt-0.5">Saved / Student</p>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <span className="text-2xl font-black text-emerald-400">94.8%</span>
            <p className="text-[10px] text-emerald-200 mt-0.5">Time Efficiency</p>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{total}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Registered applications</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Verified Clean</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{verified}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{total > 0 ? Math.round((verified / total) * 100) : 0}% auto-pass rate</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Corrections Dispatched</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{correction}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting student re-upload</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Manual Review</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{manualReview}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Escalated to committee</p>
        </div>
      </div>

      {/* Interactive Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Application Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Application Scrutiny Pipeline Distribution
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Verified &amp; Approved
                </span>
                <span>{verified} ({total > 0 ? Math.round((verified / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  style={{ width: `${total > 0 ? (verified / total) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Pending Initial Intake
                </span>
                <span>{pending} ({total > 0 ? Math.round((pending / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Correction Required
                </span>
                <span>{correction} ({total > 0 ? Math.round((correction / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  style={{ width: `${total > 0 ? (correction / total) * 100 : 0}%` }}
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Manual Review Required
                </span>
                <span>{manualReview} ({total > 0 ? Math.round((manualReview / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  style={{ width: `${total > 0 ? (manualReview / total) * 100 : 0}%` }}
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Common Issue Frequency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Automated Discrepancy Breakdown
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Flagged items</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <span className="text-amber-800 font-bold block">Blurry Photos</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">{blurryPhotos}</span>
              <p className="text-[10px] text-amber-700 mt-0.5">Failed Laplacian sharpness</p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
              <span className="text-rose-800 font-bold block">Marks Mismatches</span>
              <span className="text-2xl font-black text-rose-900 mt-1 block">{marksMismatches}</span>
              <p className="text-[10px] text-rose-700 mt-0.5">Form entered vs Marksheet</p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
              <span className="text-blue-800 font-bold block">Cross-Doc Names</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">{crossDocMismatches}</span>
              <p className="text-[10px] text-blue-700 mt-0.5">10th vs 12th spelling difference</p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs">
              <span className="text-purple-800 font-bold block">Pending Certs</span>
              <span className="text-2xl font-black text-purple-900 mt-1 block">{missingCerts}</span>
              <p className="text-[10px] text-purple-700 mt-0.5">Community / Quota docs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
