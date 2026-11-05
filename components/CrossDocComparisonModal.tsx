import React, { useState } from 'react';
import { CrossDocComparison, Student, UploadedDocument } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Check,
  Edit3,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface CrossDocComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  comparison?: CrossDocComparison;
  doc10th?: UploadedDocument;
  doc12th?: UploadedDocument;
  onConfirm?: (candidateName: string, remarks: string) => void;
}

export const CrossDocComparisonModal: React.FC<CrossDocComparisonModalProps> = ({
  isOpen,
  onClose,
  student,
  comparison: passedComparison,
  doc10th,
  doc12th,
  onConfirm,
}) => {
  const { confirmTeacherCrossDoc } = useApp();
  const comparison = passedComparison || student.crossDocComparison;
  const [confirmedName, setConfirmedName] = useState(
    comparison?.teacherConfirmedName || comparison?.name12th || student.name
  );
  const [teacherNotes, setTeacherNotes] = useState(comparison?.teacherNotes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !comparison) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(confirmedName, teacherNotes);
    } else {
      confirmTeacherCrossDoc(student.id, confirmedName, teacherNotes);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const getMatchBadge = (status: 'MATCH' | 'MINOR_DIFFERENCE' | 'MISMATCH' | 'NOT_AVAILABLE') => {
    switch (status) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Exact Match (100%)
          </span>
        );
      case 'MINOR_DIFFERENCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Minor Difference ({comparison.similarityPercentage}%)
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Discrepancy Flagged
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Not Available
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cross-Document Identity Intelligence</h3>
              <p className="text-xs text-slate-300">
                10th SSLC vs 12th HSC Marksheet automated reconciliation for {student.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Summary Banner */}
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              comparison.nameMatch === 'MATCH' && comparison.dobMatch === 'MATCH'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Automated Reconciliation Audit</p>
              <p className="mt-0.5 leading-relaxed">{comparison.summary}</p>
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-1/4">Field Parameter</th>
                  <th className="py-3 px-4 w-1/3 bg-emerald-50/40">10th SSLC Marksheet Scan</th>
                  <th className="py-3 px-4 w-1/3 bg-blue-50/40">12th HSC Marksheet Scan</th>
                  <th className="py-3 px-4">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Row 1: Candidate Name */}
                <tr className={comparison.nameMatch === 'MISMATCH' ? 'bg-rose-50/30' : ''}>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Candidate Full Name</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 bg-emerald-50/20">
                    {comparison.name10th || 'Not detected'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 bg-blue-50/20">
                    {comparison.name12th || 'Not detected'}
                  </td>
                  <td className="py-3.5 px-4">{getMatchBadge(comparison.nameMatch)}</td>
                </tr>

                {/* Row 2: Date of Birth */}
                <tr className={comparison.dobMatch === 'MISMATCH' ? 'bg-rose-50/30' : ''}>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Date of Birth (DOB)</td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 bg-emerald-50/20">
                    {comparison.dob10th || '14/05/2006'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 bg-blue-50/20">
                    {comparison.dob12th || '14/05/2006'}
                  </td>
                  <td className="py-3.5 px-4">{getMatchBadge(comparison.dobMatch)}</td>
                </tr>

                {/* Row 3: Father / Guardian Name */}
                <tr className={comparison.fatherNameMatch === 'MISMATCH' ? 'bg-rose-50/30' : ''}>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Father's Name</td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 bg-emerald-50/20">
                    {comparison.fatherName10th || 'RAMANATHAN K'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 bg-blue-50/20">
                    {comparison.fatherName12th || 'RAMANATHAN K'}
                  </td>
                  <td className="py-3.5 px-4">{getMatchBadge(comparison.fatherNameMatch)}</td>
                </tr>

                {/* Row 4: Registration Numbers */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Board Registration No</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 bg-emerald-50/20">
                    {comparison.regNo10th || 'SSLC-892104'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 bg-blue-50/20">
                    {comparison.regNo12th || student.registerNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] text-slate-500 font-mono">Separate Boards</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Teacher Confirmation & Standardize Name Control */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-700" />
                  Teacher Official Confirmation &amp; Name Standardization
                </h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  Confirm the legally recognized name spelling to be registered for college admission &amp; university degrees.
                </p>
              </div>

              {comparison.isConfirmedByTeacher && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Teacher Confirmed
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Standardized Official Name for University Records:
                </label>
                <input
                  type="text"
                  value={confirmedName}
                  onChange={(e) => setConfirmedName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scrutiny Remarks / Resolution Notes:
                </label>
                <input
                  type="text"
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="e.g. Verified with parent Aadhar / expanded initial accepted."
                  className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Action will be permanently recorded in candidate verification history.
              </span>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{savedSuccess ? 'Confirmed & Saved!' : 'Confirm & Standardize Credentials'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
