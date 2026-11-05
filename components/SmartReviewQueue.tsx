import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, UploadedDocument, ApplicationStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  FileCheck,
  Camera,
  FileText,
  UserCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartReviewQueueProps {
  onOpenStudent: (student: Student) => void;
  onOpenCrossDoc?: (student: Student) => void;
  onOpenDeadline?: (student: Student) => void;
  onOpenCorrection?: (templateId: string) => void;
}

export const SmartReviewQueue: React.FC<SmartReviewQueueProps> = ({
  onOpenStudent,
  onOpenCrossDoc,
  onOpenDeadline,
  onOpenCorrection,
}) => {
  const { students, documents, adminReviewApplication } = useApp();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'URGENT' | 'CORRECTION' | 'CLEAN'>('ALL');

  // Categorize and prioritize applications
  const prioritizedList = [...students].map((student) => {
    const stdDocs = documents.filter((d) => d.studentId === student.id);
    const mark12 = stdDocs.find((d) => d.docType === 'marksheet_12');
    const photo = stdDocs.find((d) => d.docType === 'photo');

    const issues: { type: 'danger' | 'warning' | 'info'; text: string; actionHint: string }[] = [];

    // 1. Photo issues
    if (photo?.photoQuality?.isBlurry) {
      issues.push({
        type: 'danger',
        text: `Blurry passport photo detected (${photo.photoQuality.score}/100 biometric score)`,
        actionHint: 'Request new studio photograph',
      });
    }

    // 2. Marks issues
    if (student.status === 'Correction Required') {
      issues.push({
        type: 'warning',
        text: 'Academic marks entry mismatch vs 12th marksheet OCR',
        actionHint: 'Student must verify Mathematics or Physics marks',
      });
    }

    // 3. Cross-Doc issues
    if (student.crossDocComparison?.nameMatch === 'MINOR_DIFFERENCE') {
      issues.push({
        type: 'warning',
        text: `Name spelling variation: "${student.crossDocComparison.name10th}" vs "${student.crossDocComparison.name12th}"`,
        actionHint: 'Teacher can confirm one-letter spelling difference',
      });
    } else if (student.crossDocComparison?.nameMatch === 'MISMATCH') {
      issues.push({
        type: 'danger',
        text: 'Severe candidate name mismatch across certificates',
        actionHint: 'Dean manual review required',
      });
    }

    // 4. Duplicate checks
    const hasDuplicate = stdDocs.some((d) => d.isDuplicate);
    if (hasDuplicate) {
      issues.push({
        type: 'danger',
        text: 'Duplicate certificate cryptographic hash detected across requirements',
        actionHint: 'Verify candidate uploaded unique documents',
      });
    }

    // Determine urgency level
    let urgency: 'URGENT' | 'CORRECTION' | 'CLEAN' = 'CLEAN';
    if (
      student.status === 'Manual Review Required' ||
      hasDuplicate ||
      student.crossDocComparison?.nameMatch === 'MISMATCH'
    ) {
      urgency = 'URGENT';
    } else if (
      student.status === 'Correction Required' ||
      photo?.photoQuality?.isBlurry ||
      student.crossDocComparison?.nameMatch === 'MINOR_DIFFERENCE'
    ) {
      urgency = 'CORRECTION';
    } else {
      urgency = 'CLEAN';
    }

    return {
      student,
      docs: stdDocs,
      issues,
      urgency,
    };
  });

  // Sort: URGENT first, then CORRECTION, then CLEAN
  const sortedList = prioritizedList.sort((a, b) => {
    const weights = { URGENT: 3, CORRECTION: 2, CLEAN: 1 };
    return weights[b.urgency] - weights[a.urgency];
  });

  const filteredList = sortedList.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.urgency === activeFilter;
  });

  const urgentCount = prioritizedList.filter((i) => i.urgency === 'URGENT').length;
  const correctionCount = prioritizedList.filter((i) => i.urgency === 'CORRECTION').length;
  const cleanCount = prioritizedList.filter((i) => i.urgency === 'CLEAN').length;

  const handleQuickApprove = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    adminReviewApplication(
      studentId,
      'Verified',
      'Verified by Admissions Committee via Smart Review Queue'
    );
  };

  return (
    <div className="space-y-6">
      {/* Queue Header & Filter Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Smart Priority Review Queue</h2>
            <span className="text-xs bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-mono font-bold">
              AI Triage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intelligently bubbles high-risk discrepancies (blurry photos, marks mismatch, spelling differences) to the top.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({prioritizedList.length})
          </button>
          <button
            onClick={() => setActiveFilter('URGENT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeFilter === 'URGENT'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Urgent Review ({urgentCount})
          </button>
          <button
            onClick={() => setActiveFilter('CORRECTION')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeFilter === 'CORRECTION'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Correction Needed ({correctionCount})
          </button>
          <button
            onClick={() => setActiveFilter('CLEAN')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeFilter === 'CLEAN'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Clean / Pass ({cleanCount})
          </button>
        </div>
      </div>

      {/* Queue Items List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No candidate applications found in this queue category.
          </div>
        ) : (
          filteredList.map(({ student, issues, urgency }) => {
            const isUrgent = urgency === 'URGENT';
            const isCorrection = urgency === 'CORRECTION';

            return (
              <div
                key={student.id}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-2xs hover:shadow-md ${
                  isUrgent
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isCorrection
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Candidate Details */}
                  <div className="space-y-1.5 min-w-[280px]">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                      <StatusBadge status={student.status} size="sm" />
                      {isUrgent && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          High Priority
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>{student.applicationId}</span>
                      <span>•</span>
                      <span>Reg: {student.registerNumber}</span>
                      <span>•</span>
                      <span>{student.courseApplied}</span>
                      <span>•</span>
                      <span>Score: {student.totalEnteredMarks}/600 ({student.enteredPercentage}%)</span>
                    </div>
                  </div>

                  {/* Middle: Detected Discrepancies & Hints */}
                  <div className="flex-1 space-y-1.5 w-full">
                    {issues.length > 0 ? (
                      issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-2 rounded-lg flex items-start gap-2 ${
                            issue.type === 'danger'
                              ? 'bg-rose-50 text-rose-900 border border-rose-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">{issue.text}</span>
                            <span className="text-slate-500 block text-[11px] mt-0.5">
                              Suggested action: {issue.actionHint}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>All certificates match OCR data and meet biometric quality criteria.</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {student.crossDocComparison && (
                      <button
                        onClick={() => onOpenCrossDoc?.(student)}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        title="View 10th vs 12th side by side"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-blue-700" />
                        <span>Cross-Doc</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenDeadline?.(student)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      title="Set correction deadline & reminder"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <span>Deadline</span>
                    </button>

                    <button
                      onClick={() => onOpenStudent(student)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    {student.status !== 'Verified' && (
                      <button
                        onClick={(e) => handleQuickApprove(student.id, e)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        title="Quick approve application"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
