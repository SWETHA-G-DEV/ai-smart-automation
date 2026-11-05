import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  FileCheck2,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Layers,
  ChevronRight,
  GraduationCap,
  Download,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { CorrectionGuidanceModal } from '../components/CorrectionGuidanceModal';

interface HomePageProps {
  setCurrentView: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentView }) => {
  const { switchDemoUser } = useApp();
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Navy Blue gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/80 border border-blue-700/60 text-blue-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Next-Gen College Admission Document Verification</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                SmartAdmit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">AI</span>
                <br />
                <span className="text-2xl sm:text-3xl font-bold text-slate-200">
                  Intelligent Admission Verification &amp; Teacher Workload Reduction System
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Empowering students with pre-submission error correction while slashing college teachers' verification workload by 80%.
                Featuring <strong>Tesseract.js OCR</strong>, <strong>Cross-Document Intelligence</strong> (10th vs 12th marksheet comparison),
                <strong>One-Click Batch Verification</strong>, <strong>Biometric Photo Auditing</strong>, and a <strong>Bilingual Tamil/English Voice Assistant</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentView('student-register')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 group cursor-pointer"
                >
                  <span>Get Started (New Applicant)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentView('student-login')}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm rounded-xl transition cursor-pointer"
                >
                  Student Portal Login
                </button>

                <button
                  onClick={() => {
                    switchDemoUser('admin');
                    setCurrentView('admin-dashboard');
                  }}
                  className="px-5 py-3.5 bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-700/50 text-cyan-200 font-semibold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Admin Verification Portal</span>
                </button>
              </div>

              {/* Fast 1-Click Interactive Demo Buttons */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  ⚡ 1-Click Interactive Demo Accounts:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      switchDemoUser('student', 'std-01');
                      setCurrentView('student-dashboard');
                    }}
                    className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kavitha (100% Verified Profile)</span>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('student', 'std-02');
                      setCurrentView('student-dashboard');
                    }}
                    className="px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rahul (Discrepancy &amp; Blurry Photo)</span>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('student', 'std-03');
                      setCurrentView('student-dashboard');
                    }}
                    className="px-3 py-1.5 bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Praveen (Manual Review Required)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">LIVE VALIDATION ENGINE PREVIEW</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ready (In-Browser)
                  </span>
                </div>

                {/* Simulated Marksheet OCR Result */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Tesseract OCR Extraction
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Confidence 96%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div>Candidate: KAVITHA RAMAN</div>
                    <div>Register: 7112024</div>
                    <div className="text-emerald-400">Math: 95/100 (MATCH)</div>
                    <div className="text-emerald-400">Physics: 91/100 (MATCH)</div>
                  </div>
                </div>

                {/* Photo Quality Meter Sample */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-indigo-400" /> Biometric Photo Quality Check
                    </span>
                    <span className="text-xs font-bold text-blue-300">Score 95 / 100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full w-[95%]"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Sharpness: 88/100</span>
                    <span>Brightness: 54% (Normal)</span>
                    <span>Resolution: 350x450px</span>
                  </div>
                </div>

                {/* Duplicate Hash Protection */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">SHA-256 Duplicate Check</span>
                    <p className="text-[11px] text-slate-400 font-mono">e3b0c44298fc1c149afbf4c8...</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Distinct File
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setIsGuidanceOpen(true)}
                    className="text-blue-400 hover:text-blue-300 underline font-medium text-xs flex items-center gap-1"
                  >
                    <span>View Bilingual Tamil/English Guidance</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('tracking')}
                    className="text-slate-300 hover:text-white font-medium flex items-center gap-1"
                  >
                    <span>Track with Application ID</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Intelligent Automation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered to Eliminate Admission Inefficiencies
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Every document is systematically analyzed client-side for legibility, authenticity signals, and
            academic eligibility without cloud lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Marksheet OCR */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">In-Browser Marksheet OCR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by client-side <strong>Tesseract.js</strong>. Extracts candidate name, board register
              number, subject titles, and individual marks. Never invents marks when text is ambiguous.
            </p>
            <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 pt-1">
              <span>Extracts Tamil Nadu, CBSE &amp; ICSE marks</span>
            </div>
          </div>

          {/* Feature 2: Automated Cross Validation */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Marks Cross-Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subject-wise comparison between student entered marks and OCR output. Matching rows light up in{' '}
              <strong className="text-emerald-700">green</strong>; discrepancies are marked in{' '}
              <strong className="text-rose-700">red</strong> with editable override fields.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1">
              <span>Instant discrepancy detection</span>
            </div>
          </div>

          {/* Feature 3: Biometric Photo Checker */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Biometric Photo Quality Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time Laplacian edge-variance blur detection, luminance brightness calculation, resolution
              check (min 300x400 px), and aspect ratio analysis with an intuitive 0-100 score.
            </p>
            <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1 pt-1">
              <span>Direct replacement upload option</span>
            </div>
          </div>

          {/* Feature 4: SHA-256 Duplicate Check */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Duplicate Upload Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes SHA-256 hashes via the Web Crypto API to detect if a student accidentally uploaded the
              same certificate across different checklist slots (e.g. 10th marksheet uploaded for TC).
            </p>
            <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 pt-1">
              <span>Prevents misfiled applications</span>
            </div>
          </div>

          {/* Feature 5: Cutoff & Eligibility Engine */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Course Eligibility &amp; Cutoff</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates standard Tamil Nadu Engineering Cut-off (Maths + (Physics + Chemistry)/2 out of 200).
              Compares against configurable quota thresholds for General, OBC, BC, MBC, SC, and ST.
            </p>
            <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 pt-1">
              <span>Configurable administrative rules</span>
            </div>
          </div>

          {/* Feature 6: jsPDF Dossier Generation */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">PDF Verification Dossiers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates official downloadable verification summary reports using <strong>jsPDF</strong> with
              student details, document audit checklists, marks comparison table, photo score, and verifier stamps.
            </p>
            <div className="text-[11px] font-semibold text-cyan-700 flex items-center gap-1 pt-1">
              <span>Ready for counseling desks</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4 Clear Steps) */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Simple 4-Step Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How SmartAdmit AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="text-3xl font-black text-blue-900/20 mb-2">01</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Student Uploads Files</h4>
              <p className="text-xs text-slate-600">
                Applicant uploads 10th &amp; 12th marksheets, TC, passport photo, and optional community
                certificate (PDF/JPG/PNG).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="text-3xl font-black text-blue-900/20 mb-2">02</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Automated Extraction</h4>
              <p className="text-xs text-slate-600">
                Tesseract.js extracts marks and details while the photo quality engine audits sharpness,
                luminance, and aspect ratio.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="text-3xl font-black text-blue-900/20 mb-2">03</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Discrepancy Resolution</h4>
              <p className="text-xs text-slate-600">
                If photo is blurry or marks mismatch, the system provides bilingual Tamil &amp; English
                guidance so students can correct it promptly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <div className="text-3xl font-black text-blue-900/20 mb-2">04</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Admin Sign-Off &amp; PDF</h4>
              <p className="text-xs text-slate-600">
                Admissions officers review the aggregated dossier, calculate cutoff eligibility, approve, and
                export the official PDF report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bilingual Guidance Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Smart Bilingual Guidance / இருமொழி உதவி
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Tamil &amp; English Correction Assistant
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              When documents fail quality criteria, students receive actionable instructions in simple English and
              தமிழ் (Tamil) explaining what went wrong and how to re-upload.
            </p>
          </div>
          <button
            onClick={() => setIsGuidanceOpen(true)}
            className="px-5 py-3 bg-white text-blue-950 font-bold text-xs rounded-xl hover:bg-slate-100 transition shrink-0 shadow-md cursor-pointer"
          >
            Open Correction Assistant
          </button>
        </div>
      </section>

      {/* Correction Modal */}
      <CorrectionGuidanceModal isOpen={isGuidanceOpen} onClose={() => setIsGuidanceOpen(false)} />
    </div>
  );
};
