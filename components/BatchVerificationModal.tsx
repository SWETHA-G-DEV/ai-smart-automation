import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateBatchResults, exportBatchResultsToCsv } from '../utils/batchProcessor';
import { BatchVerificationResultItem } from '../types';
import {
  Layers,
  X,
  Play,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';

interface BatchVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchVerificationModal: React.FC<BatchVerificationModalProps> = ({ isOpen, onClose }) => {
  const { students, documents, courseRules } = useApp();

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchVerificationResultItem[]>([]);
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const handleRunBatch = () => {
    setIsRunning(true);
    setProgress(15);
    setResults([]);

    setTimeout(() => {
      setProgress(45);
      setTimeout(() => {
        setProgress(85);
        setTimeout(() => {
          const generated = generateBatchResults(students, documents, courseRules);
          setResults(generated);
          setProgress(100);
          setIsRunning(false);
        }, 300);
      }, 400);
    }, 400);
  };

  const handleExportCsv = () => {
    if (results.length === 0) {
      const generated = generateBatchResults(students, documents, courseRules);
      exportBatchResultsToCsv(generated);
    } else {
      exportBatchResultsToCsv(results);
    }
  };

  const filteredResults = results.filter((r) => {
    const matchSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = outcomeFilter === 'ALL' || r.verificationOutcome === outcomeFilter;
    return matchSearch && matchFilter;
  });

  const autoPassedCount = results.filter((r) => r.verificationOutcome === 'Auto-Passed').length;
  const correctionCount = results.filter((r) => r.verificationOutcome === 'Correction Required').length;
  const reviewCount = results.filter((r) => r.verificationOutcome === 'Manual Review Required').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">One-Click Batch Verification Engine</h3>
                <span className="text-[10px] font-bold bg-cyan-400 text-blue-950 px-2 py-0.5 rounded uppercase">
                  Automated Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Process candidate applications in parallel, cross-verify marksheets &amp; export audit sheets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Candidates in Intake Pool:</span>
              <span className="font-extrabold text-blue-900 text-sm">{students.length} Applications</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Each student certificate packet is isolated into its own validation sandbox to prevent data cross-contamination.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunBatch}
              disabled={isRunning}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer ${
                isRunning
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-950 text-white'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Processing Pipeline...' : 'Run 1-Click Verification'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel / CSV</span>
            </button>
          </div>
        </div>

        {/* Progress Bar (when running) */}
        {isRunning && (
          <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-200">
            <div className="flex items-center justify-between text-xs text-blue-900 font-semibold mb-1">
              <span>Running OCR extraction, marks cross-check &amp; biometric quality audit...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Filter Stats Bar (if results available) */}
        {results.length > 0 && (
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOutcomeFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  outcomeFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setOutcomeFilter('Auto-Passed')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  outcomeFilter === 'Auto-Passed'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Auto-Passed ({autoPassedCount})
              </button>
              <button
                onClick={() => setOutcomeFilter('Correction Required')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  outcomeFilter === 'Correction Required'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Correction Required ({correctionCount})
              </button>
              <button
                onClick={() => setOutcomeFilter('Manual Review Required')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  outcomeFilter === 'Manual Review Required'
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                Manual Review ({reviewCount})
              </button>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search result..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Results Table Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {results.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Batch Pipeline Ready</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>"Run 1-Click Verification"</strong> to trigger automated OCR extraction,
                academic marks cross-checking, photo biometric checks, and cross-document validation across all registered students.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student &amp; ID</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Marks Check</th>
                    <th className="py-2.5 px-3">Photo Quality</th>
                    <th className="py-2.5 px-3">Cross-Doc</th>
                    <th className="py-2.5 px-3">Outcome</th>
                    <th className="py-2.5 px-3">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{r.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {r.applicationId} • {r.registerNumber}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-700">{r.course.split(' ')[0]}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-slate-800">
                          {r.totalEnteredMarks} / {r.extractedTotalMarks ?? 'OCR Pending'}
                        </div>
                        <span
                          className={`text-[10px] font-bold ${
                            r.marksMatch === 'MATCH'
                              ? 'text-emerald-700'
                              : r.marksMatch === 'MISMATCH'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {r.marksMatch}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
                            r.photoScore >= 70 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {r.photoScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            r.crossDocStatus === 'MATCH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.crossDocStatus === 'MINOR_DIFFERENCE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.crossDocStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.verificationOutcome === 'Auto-Passed'
                              ? 'bg-emerald-600 text-white'
                              : r.verificationOutcome === 'Correction Required'
                              ? 'bg-amber-600 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {r.verificationOutcome}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">
                        {r.flags.length > 0 ? (
                          <ul className="list-disc pl-3 text-rose-600 space-y-0.5">
                            {r.flags.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-emerald-700 font-medium">Clean verification</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Exported Excel/CSV complies with Anna University and State Admission Committee format.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close / நிறைவு
          </button>
        </div>
      </div>
    </div>
  );
};
