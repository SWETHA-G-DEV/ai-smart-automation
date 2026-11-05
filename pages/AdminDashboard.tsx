import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, DocumentType, Student, UploadedDocument } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { EligibilityBadge } from '../components/EligibilityBadge';
import { MarksValidationTable } from '../components/MarksValidationTable';
import { SmartReviewQueue } from '../components/SmartReviewQueue';
import { CrossDocComparisonModal } from '../components/CrossDocComparisonModal';
import { SideBySideDocViewer } from '../components/SideBySideDocViewer';
import { DeadlineManagerModal } from '../components/DeadlineManagerModal';
import { BatchVerificationModal } from '../components/BatchVerificationModal';
import { WorkloadAnalyticsView } from '../components/WorkloadAnalyticsView';
import { VerificationAuditTimeline } from '../components/VerificationAuditTimeline';
import { CorrectionGuidanceModal } from '../components/CorrectionGuidanceModal';
import { evaluateAdmissionEligibility } from '../utils/validation';
import { generateVerificationPdfReport } from '../utils/pdfGenerator';
import { CORRECTION_TEMPLATES } from '../utils/correctionAssistant';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Download,
  Eye,
  Camera,
  Layers,
  Sparkles,
  UserCheck,
  X,
  FileText,
  Copy,
  SlidersHorizontal,
  FileCheck,
  Calendar,
  BarChart3,
  ListOrdered,
  SplitSquareVertical,
  Check,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  setCurrentView: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentView }) => {
  const {
    students,
    documents,
    courseRules,
    documentRequirements,
    adminReviewApplication,
    confirmTeacherCrossDoc,
    setStudentCorrectionDeadline,
  } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'queue' | 'applications' | 'crossdoc' | 'analytics' | 'deadlines'
  >('queue');

  // Search & Filters for All Applications table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [crossDocStudent, setCrossDocStudent] = useState<Student | null>(null);
  const [sideBySideDoc, setSideBySideDoc] = useState<UploadedDocument | null>(null);
  const [deadlineStudent, setDeadlineStudent] = useState<Student | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [selectedGuidanceTemplateId, setSelectedGuidanceTemplateId] = useState<string | undefined>();

  // Review action modal fields
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Verified');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Metrics
  const totalApps = students.length;
  const verifiedCount = students.filter((s) => s.status === 'Verified').length;
  const pendingCount = students.filter(
    (s) => s.status === 'Submitted' || s.status === 'Under Verification'
  ).length;
  const correctionCount = students.filter((s) => s.status === 'Correction Required').length;
  const manualReviewCount = students.filter((s) => s.status === 'Manual Review Required').length;

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchCourse = courseFilter === 'ALL' || s.courseApplied.includes(courseFilter);
    return matchSearch && matchStatus && matchCourse;
  });

  const openStudentModal = (student: Student) => {
    setSelectedStudent(student);
    setNewStatus(student.status);
    setAdminNotes(student.adminReviewNotes || '');
    setSelectedTemplateId('');
  };

  const handleSaveDecision = () => {
    if (!selectedStudent) return;

    let corrections: Array<{ docType: DocumentType; messageEn: string; messageTa: string }> | undefined;

    if (newStatus === 'Correction Required' && selectedTemplateId) {
      const tmpl = CORRECTION_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (tmpl) {
        corrections = [
          {
            docType: tmpl.docType,
            messageEn: tmpl.exampleMessageEn,
            messageTa: tmpl.exampleMessageTa,
          },
        ];
      }
    }

    if (newStatus === 'Verified') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }

    adminReviewApplication(selectedStudent.id, newStatus, adminNotes, corrections);

    // Refresh selectedStudent
    const updated = {
      ...selectedStudent,
      status: newStatus,
      adminReviewNotes: adminNotes,
    };
    setSelectedStudent(updated);
  };

  const handleDownloadDossier = (student: Student) => {
    const studentDocs = documents.filter((d) => d.studentId === student.id);
    generateVerificationPdfReport(student, studentDocs, courseRules);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Teacher Admissions Workstation
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-1 rounded border border-blue-200">
              Workload Reduction System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated verification pipeline with OCR extraction, cross-document intelligence, and bilingual assistant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-300" />
            <span>1-Click Batch Verification</span>
          </button>

          <button
            onClick={() => setIsGuidanceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Bilingual Assistant (Tamil/En)</span>
          </button>

          <button
            onClick={() => setCurrentView('admin-settings')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Cutoff &amp; Checklist Rules</span>
          </button>
        </div>
      </div>

      {/* Primary Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Smart Review Queue</span>
          {manualReviewCount + correctionCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {manualReviewCount + correctionCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Applications ({totalApps})</span>
        </button>

        <button
          onClick={() => setActiveTab('crossdoc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
            activeTab === 'crossdoc'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Cross-Doc Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Workload Analytics &amp; Time Saved</span>
        </button>

        <button
          onClick={() => setActiveTab('deadlines')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
            activeTab === 'deadlines'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Deadlines &amp; Reminders</span>
        </button>
      </div>

      {/* TAB 1: SMART REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <SmartReviewQueue
          onOpenStudent={openStudentModal}
          onOpenCrossDoc={(std) => setCrossDocStudent(std)}
          onOpenDeadline={(std) => setDeadlineStudent(std)}
          onOpenCorrection={(templateId) => {
            setSelectedGuidanceTemplateId(templateId);
            setIsGuidanceModalOpen(true);
          }}
        />
      )}

      {/* TAB 2: ALL APPLICATIONS & CHECKLIST */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              onClick={() => setStatusFilter('ALL')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                statusFilter === 'ALL'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-blue-300'
              }`}
            >
              <span className={`text-xs font-bold uppercase ${statusFilter === 'ALL' ? 'text-blue-200' : 'text-slate-400'}`}>
                Total Applications
              </span>
              <div className="text-2xl font-black mt-1">{totalApps}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'ALL' ? 'text-blue-200' : 'text-slate-500'}`}>
                All received
              </p>
            </div>

            <div
              onClick={() => setStatusFilter('Verified')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                statusFilter === 'Verified'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <span className={`text-xs font-bold uppercase ${statusFilter === 'Verified' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                Verified &amp; Approved
              </span>
              <div className="text-2xl font-black mt-1">{verifiedCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'Verified' ? 'text-emerald-200' : 'text-slate-500'}`}>
                Ready for counseling
              </p>
            </div>

            <div
              onClick={() => setStatusFilter('Submitted')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                statusFilter === 'Submitted'
                  ? 'bg-blue-800 text-white border-blue-800 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-blue-300'
              }`}
            >
              <span className={`text-xs font-bold uppercase ${statusFilter === 'Submitted' ? 'text-blue-200' : 'text-blue-700'}`}>
                Pending Verification
              </span>
              <div className="text-2xl font-black mt-1">{pendingCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'Submitted' ? 'text-blue-200' : 'text-slate-500'}`}>
                In intake queue
              </p>
            </div>

            <div
              onClick={() => setStatusFilter('Correction Required')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                statusFilter === 'Correction Required'
                  ? 'bg-amber-800 text-white border-amber-800 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-amber-300'
              }`}
            >
              <span className={`text-xs font-bold uppercase ${statusFilter === 'Correction Required' ? 'text-amber-200' : 'text-amber-700'}`}>
                Corrections Needed
              </span>
              <div className="text-2xl font-black mt-1">{correctionCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'Correction Required' ? 'text-amber-200' : 'text-slate-500'}`}>
                Awaiting student fix
              </p>
            </div>

            <div
              onClick={() => setStatusFilter('Manual Review Required')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                statusFilter === 'Manual Review Required'
                  ? 'bg-purple-800 text-white border-purple-800 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-purple-300'
              }`}
            >
              <span className={`text-xs font-bold uppercase ${statusFilter === 'Manual Review Required' ? 'text-purple-200' : 'text-purple-700'}`}>
                Manual Review
              </span>
              <div className="text-2xl font-black mt-1">{manualReviewCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'Manual Review Required' ? 'text-purple-200' : 'text-slate-500'}`}>
                Dean committee action
              </p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, application ID, or register no..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Correction Required">Correction Required</option>
                <option value="Verified">Verified</option>
                <option value="Manual Review Required">Manual Review Required</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Course:</span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden max-w-[200px]"
              >
                <option value="ALL">All Courses</option>
                {courseRules.map((c) => (
                  <option key={c.courseCode} value={c.courseCode.replace('BE-', '').replace('BTECH-', '')}>
                    {c.courseName.split(' ')[0]} {c.courseName.split(' ')[1]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student &amp; App ID</th>
                    <th className="py-3.5 px-4">Course &amp; Quota</th>
                    <th className="py-3.5 px-4">12th Marks (Aggregate)</th>
                    <th className="py-3.5 px-4">Cutoff &amp; Eligibility</th>
                    <th className="py-3.5 px-4">Biometrics &amp; OCR</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No candidate applications matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => {
                      const stdDocs = documents.filter((d) => d.studentId === std.id);
                      const mark12 = stdDocs.find((d) => d.docType === 'marksheet_12');
                      const photo = stdDocs.find((d) => d.docType === 'photo');
                      const elig = evaluateAdmissionEligibility(std, courseRules);

                      return (
                        <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{std.name}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>{std.applicationId}</span>
                              <span>•</span>
                              <span>Reg: {std.registerNumber}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{std.courseApplied}</div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                              Quota: {std.quota}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-blue-900">{std.totalEnteredMarks} / 600</div>
                            <div className="text-[11px] text-slate-500">{std.enteredPercentage}% aggregate</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <EligibilityBadge evaluation={elig} showScore={true} />
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Camera className="w-3.5 h-3.5 text-blue-600" />
                              {photo?.photoQuality ? (
                                <span
                                  className={`font-semibold ${
                                    photo.photoQuality.isBlurry ? 'text-rose-600 font-bold' : 'text-slate-700'
                                  }`}
                                >
                                  Photo: {photo.photoQuality.score}/100 {photo.photoQuality.isBlurry && '(Blurry)'}
                                </span>
                              ) : (
                                <span className="text-slate-400">Photo Pending</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              {mark12?.ocrResult ? (
                                <span className="text-slate-700">
                                  OCR Conf: {mark12.ocrResult.confidence}%
                                </span>
                              ) : (
                                <span className="text-slate-400">OCR Pending</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusBadge status={std.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openStudentModal(std)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                              >
                                Inspect &amp; Verify
                              </button>
                              <button
                                onClick={() => handleDownloadDossier(std)}
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Download PDF Dossier"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CROSS-DOCUMENT INTELLIGENCE */}
      {activeTab === 'crossdoc' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900">Cross-Document Intelligence Hub</h2>
            <p className="text-xs text-slate-500 mt-1">
              Automated comparison between 10th (SSLC) and 12th (HSC) Marksheets to detect spelling variations,
              DOB discrepancies, and parent name variations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => {
              const comp = student.crossDocComparison;
              const hasDiff = comp?.nameMatch !== 'MATCH' || comp?.dobMatch !== 'MATCH';

              return (
                <div
                  key={student.id}
                  className={`p-5 rounded-2xl bg-white border transition shadow-2xs ${
                    hasDiff ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">
                        {student.applicationId} • {student.courseApplied}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        comp?.nameMatch === 'MATCH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp?.nameMatch === 'MINOR_DIFFERENCE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {comp ? comp.nameMatch : 'Comparison Pending'}
                    </span>
                  </div>

                  {comp && (
                    <div className="mt-4 space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">10th Marksheet Name:</span>
                        <span className="font-mono font-semibold text-slate-800">{comp.name10th}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">12th Marksheet Name:</span>
                        <span className="font-mono font-semibold text-slate-800">{comp.name12th}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Date of Birth (DOB):</span>
                        <span className="font-mono font-semibold text-slate-800">{comp.dob10th || comp.dob12th || 'Verified'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Father's Name:</span>
                        <span className="font-mono font-semibold text-slate-800">{comp.fatherName10th || comp.fatherName12th || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Spelling Similarity Score:</span>
                        <span className="font-bold text-blue-900">{comp.similarityPercentage}%</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      {comp?.isConfirmedByTeacher
                        ? `Confirmed by: ${comp.teacherConfirmedName}`
                        : 'Action required'}
                    </span>
                    <button
                      onClick={() => setCrossDocStudent(student)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <SplitSquareVertical className="w-3.5 h-3.5" />
                      <span>Review Side-by-Side</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: WORKLOAD ANALYTICS & TIME SAVED */}
      {activeTab === 'analytics' && <WorkloadAnalyticsView students={students} documents={documents} />}

      {/* TAB 5: DEADLINES & REMINDERS */}
      {activeTab === 'deadlines' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Deadline &amp; Correction Reminder Management</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure candidate correction deadlines, track countdowns, and send reminders to pending applicants.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const hasCorrectionDeadline = Boolean(student.correctionDeadline);
              const isExpired =
                hasCorrectionDeadline &&
                new Date(student.correctionDeadline!).getTime() < Date.now();

              return (
                <div
                  key={student.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{student.applicationId}</p>
                    </div>
                    <StatusBadge status={student.status} size="sm" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Course:</span>
                      <span className="font-semibold text-slate-800">{student.courseApplied.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Correction Deadline:</span>
                      <span
                        className={`font-mono font-bold ${
                          isExpired
                            ? 'text-rose-600'
                            : hasCorrectionDeadline
                            ? 'text-blue-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {student.correctionDeadline
                          ? new Date(student.correctionDeadline).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Not set'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeadlineStudent(student)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Manage Deadline &amp; Reminder</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COMPREHENSIVE STUDENT INSPECTION MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{selectedStudent.name}</h3>
                  <StatusBadge status={selectedStudent.status} size="sm" />
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  App ID: {selectedStudent.applicationId} • 12th Reg: {selectedStudent.registerNumber} • Quota: {selectedStudent.quota}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDossier(selectedStudent)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Dossier</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Uploaded Certificates List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Uploaded Certificates &amp; Integrity Audit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {documentRequirements.map((req) => {
                    const doc = documents.find(
                      (d) => d.studentId === selectedStudent.id && d.docType === req.type
                    );
                    return (
                      <div
                        key={req.type}
                        className={`p-3 rounded-xl border text-xs ${
                          doc ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/50 border-rose-200 text-rose-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{req.title.split(' ')[0]} {req.title.split(' ')[1]}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              doc ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {doc ? doc.verificationStatus : 'Missing'}
                          </span>
                        </div>
                        {doc ? (
                          <div className="mt-2 space-y-1">
                            <p className="truncate text-slate-700 font-mono">{doc.fileName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Hash: {doc.fileHash.substring(0, 14)}...
                            </p>
                            <button
                              onClick={() => setSideBySideDoc(doc)}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold mt-1 cursor-pointer"
                            >
                              <SplitSquareVertical className="w-3 h-3" />
                              <span>Inspect Document OCR</span>
                            </button>
                          </div>
                        ) : (
                          <p className="text-[11px] text-rose-600 mt-1">Required certificate not uploaded</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Marks Comparison Table */}
              <div>
                <MarksValidationTable
                  subjects={selectedStudent.subjects}
                  ocrResult={
                    documents.find(
                      (d) => d.studentId === selectedStudent.id && d.docType === 'marksheet_12'
                    )?.ocrResult
                  }
                  isStudentMode={false}
                />
              </div>

              {/* Verification Audit Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Verification History &amp; Activity Log
                </h4>
                <VerificationAuditTimeline logs={selectedStudent.auditTrail} />
              </div>

              {/* Administrative Decision Controls */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Administrative Verification Decision
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label
                    onClick={() => setNewStatus('Verified')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      newStatus === 'Verified'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Approve &amp; Verify</span>
                  </label>

                  <label
                    onClick={() => setNewStatus('Correction Required')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      newStatus === 'Correction Required'
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Request Correction</span>
                  </label>

                  <label
                    onClick={() => setNewStatus('Manual Review Required')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      newStatus === 'Manual Review Required'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Dean Committee Review</span>
                  </label>
                </div>

                {newStatus === 'Correction Required' && (
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-amber-300">
                    <label className="block text-xs font-bold text-amber-900">
                      Select Pre-Configured Bilingual Correction Template:
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Choose template or write custom notes below --</option>
                      {CORRECTION_TEMPLATES.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {tmpl.titleEn} ({tmpl.titleTa})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Verification Remarks / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Provide specific instructions or confirmation remarks for the candidate audit trail..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Logged in as: <strong>Dr. S. K. Subramanian (Super Admin)</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDecision}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Commit Decision &amp; Notify Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CROSS-DOCUMENT COMPARISON MODAL */}
      {crossDocStudent && (
        <CrossDocComparisonModal
          isOpen={Boolean(crossDocStudent)}
          onClose={() => setCrossDocStudent(null)}
          student={crossDocStudent}
          onConfirm={(candidateName: string, remarks: string) => {
            confirmTeacherCrossDoc(crossDocStudent.id, candidateName, remarks);
            setCrossDocStudent(null);
          }}
        />
      )}

      {/* SIDE-BY-SIDE DUAL PANE DOC VIEWER */}
      {sideBySideDoc && (
        <SideBySideDocViewer
          isOpen={Boolean(sideBySideDoc)}
          onClose={() => setSideBySideDoc(null)}
          doc={sideBySideDoc}
        />
      )}

      {/* DEADLINE & REMINDER MANAGER MODAL */}
      {deadlineStudent && (
        <DeadlineManagerModal
          isOpen={Boolean(deadlineStudent)}
          onClose={() => setDeadlineStudent(null)}
          student={deadlineStudent}
          onSaveDeadline={(studentId: string, deadline: string) => {
            setStudentCorrectionDeadline(studentId, deadline);
            setDeadlineStudent(null);
          }}
        />
      )}

      {/* 1-CLICK BATCH VERIFICATION MODAL */}
      <BatchVerificationModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      {/* BILINGUAL CORRECTION ASSISTANT MODAL WITH TTS */}
      <CorrectionGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        selectedTemplateId={selectedGuidanceTemplateId}
      />
    </div>
  );
};
