import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { EligibilityBadge } from '../components/EligibilityBadge';
import { evaluateAdmissionEligibility } from '../utils/validation';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileCheck2,
  FileText,
  Sparkles,
} from 'lucide-react';

interface ApplicationTrackingPageProps {
  setCurrentView: (view: string) => void;
}

export const ApplicationTrackingPage: React.FC<ApplicationTrackingPageProps> = ({ setCurrentView }) => {
  const { students, documents, courseRules, switchDemoUser } = useApp();
  const [query, setQuery] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const clean = query.trim().toLowerCase();
    if (!clean) return;

    const match = students.find(
      (s) =>
        s.applicationId.toLowerCase() === clean ||
        s.registerNumber.toLowerCase() === clean ||
        s.email.toLowerCase() === clean ||
        s.name.toLowerCase().includes(clean)
    );
    setSearchedStudent(match || null);
  };

  const handleDirectDemoPick = (stdId: string) => {
    const s = students.find((item) => item.id === stdId);
    if (s) {
      setQuery(s.applicationId);
      setSearchedStudent(s);
      setHasSearched(true);
    }
  };

  const studentDocs = searchedStudent
    ? documents.filter((d) => d.studentId === searchedStudent.id)
    : [];
  const elig = searchedStudent
    ? evaluateAdmissionEligibility(searchedStudent, courseRules)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-Time Applicant Status Tracker</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Track Admission Application</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Enter your Application ID (e.g. SA-2024-00101) or 12th Board Register Number to inspect
          verification progress and administrative decisions.
        </p>
      </div>

      {/* Search Bar Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Application ID (SA-2024-00101) or Register No..."
              className="w-full pl-10 pr-4 py-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Click Demo Tracker Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Quick Track Samples:</span>
          {students.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleDirectDemoPick(s.id)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 font-mono text-[11px] transition"
            >
              {s.name} ({s.applicationId})
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {hasSearched && searchedStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in space-y-6 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{searchedStudent.name}</h2>
                <StatusBadge status={searchedStudent.status} size="md" />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                App ID: {searchedStudent.applicationId} • Course: {searchedStudent.courseApplied} • Quota: {searchedStudent.quota}
              </p>
            </div>

            <button
              onClick={() => {
                switchDemoUser('student', searchedStudent.id);
                setCurrentView('student-dashboard');
              }}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Open Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status Timeline Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Application Date</span>
              <p className="font-bold text-slate-900 mt-1">{searchedStudent.appliedDate}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">12th Percentage</span>
              <p className="font-bold text-blue-900 mt-1">
                {searchedStudent.enteredPercentage}% ({searchedStudent.totalEnteredMarks} marks)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Documents Uploaded</span>
              <p className="font-bold text-slate-900 mt-1">{studentDocs.length} files attached</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cut-Off Assessment</span>
              <div className="mt-1">
                {elig && <EligibilityBadge evaluation={elig} showScore={true} />}
              </div>
            </div>
          </div>

          {/* Active Notifications / Remarks */}
          {searchedStudent.adminReviewNotes && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[10px] block mb-1">
                Admission Verifier Official Remarks:
              </span>
              <p className="text-slate-700">{searchedStudent.adminReviewNotes}</p>
            </div>
          )}

          {/* Pending Corrections if any */}
          {searchedStudent.correctionsRequested?.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Action Required: Correction Requested by Admission Cell</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 pl-4 list-disc text-xs">
                {searchedStudent.correctionsRequested.map((c: any) => (
                  <li key={c.id}>
                    <strong>{c.docType.replace('_', ' ').toUpperCase()}:</strong> {c.messageEn}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {hasSearched && !searchedStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-slate-600 text-sm">
            No application found matching "<strong>{query}</strong>".
          </p>
          <p className="text-xs text-slate-400">
            Please check your Application ID (e.g. SA-2024-00101) or click one of the quick samples above.
          </p>
        </div>
      )}
    </div>
  );
};
