import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { EligibilityBadge } from '../components/EligibilityBadge';
import { DocumentUploadCard } from '../components/DocumentUploadCard';
import { MarksValidationTable } from '../components/MarksValidationTable';
import { CorrectionGuidanceModal } from '../components/CorrectionGuidanceModal';
import { ApplicationHealthScoreCard } from '../components/ApplicationHealthScoreCard';
import { VerificationAuditTimeline } from '../components/VerificationAuditTimeline';
import { evaluateAdmissionEligibility } from '../utils/validation';
import { generateVerificationPdfReport } from '../utils/pdfGenerator';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Download,
  Camera,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Check,
  LogOut,
  ShieldAlert,
  Info,
  UserCheck,
  Volume2,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  setCurrentView?: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setCurrentView }) => {
  const {
    currentUser,
    activeStudent,
    documents,
    documentRequirements,
    courseRules,
    updateStudentMarks,
    resolveCorrection,
    logout,
  } = useApp();

  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  // Strict session and data access isolation
  if (currentUser.role !== 'student' || !currentUser.student || !activeStudent) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Student Sign-In Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            To ensure complete candidate privacy, one student cannot access another student's dashboard or
            uploaded documents. Please log in with your student credentials.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView?.('student-login')}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => setCurrentView?.('student-register')}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Register New Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter documents strictly by the authenticated student's ID
  const studentDocs = documents.filter((d) => d.studentId === activeStudent.id);
  const mark12Doc = studentDocs.find((d) => d.docType === 'marksheet_12');
  const photoDoc = studentDocs.find((d) => d.docType === 'photo');

  // Mandatory requirements calculation
  const mandatoryReqs = documentRequirements.filter(
    (r) => r.isRequired || (r.type === 'community_certificate' && activeStudent.quota !== 'General')
  );

  const uploadedMandatoryCount = mandatoryReqs.filter((req) =>
    studentDocs.some((d) => d.docType === req.type)
  ).length;

  const missingDocs = mandatoryReqs.filter(
    (req) => !studentDocs.some((d) => d.docType === req.type)
  );

  const verificationProgress = Math.round((uploadedMandatoryCount / mandatoryReqs.length) * 100);

  const eligibility = evaluateAdmissionEligibility(activeStudent, courseRules);

  // Compute alternative courses
  const isReserved = activeStudent.quota !== 'General';
  const eligibleAlternatives = courseRules
    .filter((rule) => rule.courseName !== activeStudent.courseApplied)
    .filter((rule) => {
      const minPerc = isReserved ? rule.minPercentageReserved : rule.minPercentageGeneral;
      return activeStudent.enteredPercentage >= minPerc;
    })
    .slice(0, 3);

  const handleDownloadPdf = () => {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    generateVerificationPdfReport(activeStudent, studentDocs, courseRules);
  };

  const handleLogout = () => {
    logout();
    if (setCurrentView) {
      setCurrentView('student-login');
    }
  };

  const openCorrection = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsGuidanceOpen(true);
  };

  // Correction deadline countdown check
  const hasDeadline = Boolean(activeStudent.correctionDeadline);
  let deadlineDiffDays: number | null = null;
  if (hasDeadline) {
    const diff = new Date(activeStudent.correctionDeadline!).getTime() - Date.now();
    deadlineDiffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Demonstration Storage & Isolation Notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong>Demonstration Storage Notice:</strong> Session and documents for <strong>{activeStudent.name}</strong>{' '}
            are saved in browser LocalStorage. Application data persists across page refreshes.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
            Private Student Session
          </span>
        </div>
      </div>

      {/* Deadline Alert Banner (if set by teacher) */}
      {hasDeadline && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs font-semibold ${
            (deadlineDiffDays ?? 0) <= 2
              ? 'bg-rose-50 border-rose-300 text-rose-950 animate-pulse'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                Action Required: Correction Window Closes on{' '}
                {new Date(activeStudent.correctionDeadline!).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[11px] font-normal mt-0.5">
                {(deadlineDiffDays ?? 0) > 0
                  ? `You have ${deadlineDiffDays} day(s) remaining to re-upload flagged certificates.`
                  : 'Correction window has elapsed. Please consult the Admissions Office immediately.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => openCorrection('blurry_photo')}
            className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold shrink-0 transition cursor-pointer"
          >
            Fix Documents Now
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-900/60">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {activeStudent.name}!
            </h1>
            <StatusBadge status={activeStudent.status} size="lg" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
            <span>Application ID: <strong className="text-cyan-300">{activeStudent.applicationId}</strong></span>
            <span>•</span>
            <span>12th Reg: <strong>{activeStudent.registerNumber}</strong></span>
            <span>•</span>
            <span>Course: <strong>{activeStudent.courseApplied}</strong></span>
            <span>•</span>
            <span>Quota: <strong>{activeStudent.quota}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsGuidanceOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-800 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border border-blue-700"
          >
            <Volume2 className="w-4 h-4 text-cyan-300" />
            <span>Voice Guide (Tamil / En)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Dossier</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-rose-900/80 border border-slate-700 hover:border-rose-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Sign out of student account"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* MODULE 5: APPLICATION HEALTH SCORE CARD */}
      <ApplicationHealthScoreCard student={activeStudent} documents={studentDocs} />

      {/* Active Correction Notifications (Tamil & English) */}
      {activeStudent.correctionsRequested && activeStudent.correctionsRequested.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Immediate Attention Required: {activeStudent.correctionsRequested.length} Correction Notification(s)</span>
            </div>
            <button
              onClick={() => openCorrection('blurry_photo')}
              className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1 rounded-lg transition cursor-pointer"
            >
              Open Tamil / English Voice Guide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeStudent.correctionsRequested.map((corr) => (
              <div key={corr.id} className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider">
                    Doc: {corr.docType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    Action Pending
                  </span>
                </div>
                <p className="text-xs text-slate-700">{corr.messageEn}</p>
                <p className="text-xs font-semibold text-blue-900 italic border-t border-slate-100 pt-1.5">
                  {corr.messageTa}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Notified: {corr.requestedAt}</span>
                  <button
                    onClick={() => resolveCorrection(activeStudent.id, corr.id)}
                    className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary KPI Cards & Alternative Course Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Uploaded */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Documents Uploaded</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {studentDocs.length} <span className="text-sm font-normal text-slate-500">/ {documentRequirements.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {missingDocs.length === 0 ? 'All mandatory files submitted' : `${missingDocs.length} mandatory file(s) pending`}
          </p>
        </div>

        {/* Card 2: Photo Quality */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Photo Quality Biometrics</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {photoDoc?.photoQuality ? `${photoDoc.photoQuality.score} / 100` : 'Not Checked'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {photoDoc?.photoQuality
              ? photoDoc.photoQuality.isBlurry
                ? 'Out of focus / blurry'
                : 'Sharp & compliant'
              : 'Passport photo pending'}
          </p>
        </div>

        {/* Card 3: Marksheet Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Aggregate</span>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {activeStudent.totalEnteredMarks} <span className="text-sm font-normal text-slate-500">({activeStudent.enteredPercentage}%)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">6 subjects evaluated</p>
        </div>

        {/* Card 4: Cutoff & Course Eligibility */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Admission Eligibility</span>
          <div className="mt-1">
            <EligibilityBadge evaluation={eligibility} />
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate" title={eligibility.ruleName}>
            {eligibility.ruleName}
          </p>
        </div>
      </div>

      {/* MODULE 6: SMART COURSE ELIGIBILITY & ALTERNATIVE RECOMMENDATIONS */}
      {eligibleAlternatives.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
          <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
            <Compass className="w-4 h-4 text-blue-700" />
            <span>Smart Course Eligibility &amp; Alternative Degree Recommendations</span>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            Based on your HSC marks in Physics, Chemistry, and Mathematics ({activeStudent.enteredPercentage}% aggregate),
            you also meet 100% of the cut-off criteria for the following professional degrees:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {eligibleAlternatives.map((alt) => (
              <div
                key={alt.courseCode}
                className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{alt.courseName}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Eligible
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Min Req: {isReserved ? alt.minPercentageReserved : alt.minPercentageGeneral}% • Department: {alt.department}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Marks Cross-Verification Table */}
      <section className="space-y-3">
        <MarksValidationTable
          subjects={activeStudent.subjects}
          ocrResult={mark12Doc?.ocrResult}
          isStudentMode={true}
          onUpdateMarks={(updated) => updateStudentMarks(activeStudent.id, updated)}
        />
      </section>

      {/* Document Upload Checklist Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Document Upload Checklist</h2>
            <p className="text-xs text-slate-500">
              Upload clear PDF, JPG or PNG certificates. High-contrast scans yield 100% OCR accuracy.
            </p>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            <span>Supported: PDF, JPG, PNG (Max 10MB each)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documentRequirements.map((req) => {
            const uploaded = studentDocs.find((d) => d.docType === req.type);
            return (
              <DocumentUploadCard
                key={req.type}
                requirement={req}
                uploadedDoc={uploaded}
                studentId={activeStudent.id}
                isStudentView={true}
              />
            );
          })}
        </div>
      </section>

      {/* MODULE 9: VERIFICATION HISTORY & AUDIT LOG */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-700" />
          <h3 className="font-bold text-base text-slate-900">Application Activity &amp; Teacher Audit Log</h3>
        </div>
        <p className="text-xs text-slate-500">
          Transparent timeline of all verification milestones, document uploads, and teacher review remarks.
        </p>
        <VerificationAuditTimeline auditTrail={activeStudent.auditTrail} />
      </section>

      {/* Smart Correction Assistant Modal */}
      <CorrectionGuidanceModal
        isOpen={isGuidanceOpen}
        onClose={() => setIsGuidanceOpen(false)}
        selectedTemplateId={selectedTemplateId}
      />
    </div>
  );
};
