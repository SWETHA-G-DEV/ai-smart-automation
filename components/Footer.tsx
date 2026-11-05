import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, AlertCircle, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 text-blue-100" />
              </div>
              <span className="font-extrabold text-lg text-white">SmartAdmit AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated document validation, Tesseract.js OCR marksheet extraction, and biometric photo quality
              verification for collegiate admissions.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Local In-Browser Processing (Private)</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Validation Engines</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Tesseract.js Marksheet OCR &amp; Subject Parsing</li>
              <li>• Browser Canvas Biometric Photo Quality Meter</li>
              <li>• SHA-256 Web Crypto Duplicate Detector</li>
              <li>• Tamil Nadu Engineering Cut-Off Calculator (200)</li>
              <li>• Smart Bilingual (Tamil &amp; English) Correction Guidance</li>
            </ul>
          </div>

          {/* Admissions Office Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Admission Cell</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Admissions Directorate, SmartAdmit Campus, NH-47, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+91 (0427) 244-8900 / Toll Free: 1800-425-ADMIT</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>admissions@smartadmit.edu</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Educational Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Compliance Notice</h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Local Demonstration Notice</span>
              </div>
              <p className="leading-normal">
                Browser local storage is utilized for demo workflows. For production enterprise deployments, connect an
                on-premise database with encrypted FERPA/State-compliant archives.
              </p>
              <p className="text-[10px] text-slate-500">
                OCR extracts text hypotheses; physical verification of original marksheets remains mandatory.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SmartAdmit AI – College Admission Document Validation System.</p>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Client-side Tesseract.js</span>
            <span>•</span>
            <span>Zero External API Dependency</span>
            <span>•</span>
            <span>jsPDF Dossier Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
