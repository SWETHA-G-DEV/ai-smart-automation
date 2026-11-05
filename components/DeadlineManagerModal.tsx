import React, { useState } from 'react';
import { Student } from '../types';
import { useApp } from '../context/AppContext';
import { X, Calendar, Clock, Bell, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

interface DeadlineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  onSaveDeadline?: (studentId: string, deadline: string) => void;
}

export const DeadlineManagerModal: React.FC<DeadlineManagerModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveDeadline,
}) => {
  const { setStudentCorrectionDeadline, students } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(student?.id || students[0]?.id || '');
  const [deadlineDate, setDeadlineDate] = useState('2026-11-06');
  const [isReminderSent, setIsReminderSent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const handleSave = () => {
    if (selectedStudentId && deadlineDate) {
      if (onSaveDeadline) {
        onSaveDeadline(selectedStudentId, deadlineDate);
      } else {
        setStudentCorrectionDeadline(selectedStudentId, deadlineDate);
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    }
  };

  const handleSendReminder = () => {
    setIsReminderSent(true);
    setTimeout(() => setIsReminderSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Admission Deadlines &amp; Reminder Manager</h3>
              <p className="text-xs text-slate-300">Set resubmission deadlines &amp; send automated reminders</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Global Phase Deadline Info */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-blue-950">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-700" />
                Phase 1 Admission Scrutiny Deadline:
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                15 Nov 2026 (13 Days Remaining)
              </span>
            </div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              All candidate certificates, OCR verifications, and quota counseling dossiers must be finalized prior
              to seat matrix allocation.
            </p>
          </div>

          {/* Student Selector if multiple */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Candidate:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.applicationId}) — Status: {s.status}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Correction Deadline Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Candidate Resubmission Deadline Date:
            </label>
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Current deadline for {currentStudent?.name}:{' '}
              <strong className="text-slate-800">{currentStudent?.correctionDeadline || 'Not set'}</strong>
            </p>
          </div>

          {/* One-Click SMS / Email Reminder Dispatch */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Dispatch Instant Reminder Alert
              </span>
              <button
                onClick={handleSendReminder}
                disabled={isReminderSent}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{isReminderSent ? 'Reminder Dispatched!' : 'Send Reminder'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Sends automated notification to candidate's registered mobile ({currentStudent?.mobile}) and email (
              {currentStudent?.email}) notifying them of pending correction requirements.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {savedSuccess ? 'Deadline updated in audit trail!' : 'Deadline changes sync immediately.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Set Correction Deadline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
