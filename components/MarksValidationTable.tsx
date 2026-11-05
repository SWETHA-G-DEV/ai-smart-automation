import React, { useState } from 'react';
import { OcrResult, SubjectMark } from '../types';
import { compareMarks } from '../utils/validation';
import { CheckCircle2, AlertTriangle, HelpCircle, Save, Sparkles, AlertCircle } from 'lucide-react';

interface MarksValidationTableProps {
  subjects: SubjectMark[];
  ocrResult?: OcrResult;
  isStudentMode?: boolean;
  onUpdateMarks?: (updated: SubjectMark[]) => void;
}

export const MarksValidationTable: React.FC<MarksValidationTableProps> = ({
  subjects,
  ocrResult,
  isStudentMode = false,
  onUpdateMarks,
}) => {
  const [localSubjects, setLocalSubjects] = useState<SubjectMark[]>(subjects);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync if prop changes and not currently edited
  React.useEffect(() => {
    setLocalSubjects(subjects);
    setHasUnsavedChanges(false);
  }, [subjects]);

  const comparison = compareMarks(localSubjects, ocrResult?.subjects, ocrResult?.totalMarks);

  const handleMarkChange = (index: number, val: string) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    const next = [...localSubjects];
    next[index] = { ...next[index], enteredMarks: num };
    setLocalSubjects(next);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (onUpdateMarks) {
      onUpdateMarks(localSubjects);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Section */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Academic Marks Cross-Verification</h3>
            {ocrResult && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" />
                OCR Confidence: {ocrResult.confidence}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparing entered marks against automated OCR text extracted from official 12th marksheet.
          </p>
        </div>

        {isStudentMode && hasUnsavedChanges && (
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Corrected Marks</span>
          </button>
        )}
      </div>

      {/* Discrepancy Alert Banner */}
      {comparison.hasMismatch && (
        <div className="bg-rose-50 border-b border-rose-200 px-5 py-3 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Mark Discrepancy Flagged:</strong> {comparison.mismatchCount} subject(s) mismatch
              between your entered marks and the marksheet text.
            </span>
          </div>
          {isStudentMode && (
            <span className="text-[11px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-medium">
              You can adjust fields below if OCR made a reading error.
            </span>
          )}
        </div>
      )}

      {/* OCR Warnings if any */}
      {ocrResult?.warnings && ocrResult.warnings.length > 0 && (
        <div className="bg-amber-50/80 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-800 space-y-1">
          {ocrResult.warnings.map((w, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Entered Mark (Claimed)</th>
              <th className="py-3 px-4">Extracted Mark (OCR)</th>
              <th className="py-3 px-4">Status & Validation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparison.subjectComparisons.map((row, idx) => {
              const isMatch = row.status === 'MATCH';
              const isMismatch = row.status === 'MISMATCH';

              return (
                <tr
                  key={row.name}
                  className={`transition-colors ${
                    isMismatch ? 'bg-rose-50/40' : isMatch ? 'bg-emerald-50/20' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-slate-900">{row.name}</td>

                  {/* Entered Mark */}
                  <td className="py-3 px-4">
                    {isStudentMode ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={localSubjects[idx]?.enteredMarks ?? ''}
                          onChange={(e) => handleMarkChange(idx, e.target.value)}
                          className="w-16 px-2.5 py-1 text-center font-bold text-slate-900 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-xs"
                        />
                        <span className="text-slate-400 font-mono">/ 100</span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-900">{row.enteredMarks} / 100</span>
                    )}
                  </td>

                  {/* OCR Extracted Mark */}
                  <td className="py-3 px-4">
                    {row.extractedMarks !== undefined ? (
                      <span className="font-bold text-slate-800 font-mono">
                        {row.extractedMarks} / 100
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not detected by OCR</span>
                    )}
                  </td>

                  {/* Validation Match Status */}
                  <td className="py-3 px-4">
                    {isMatch ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched</span>
                      </span>
                    ) : isMismatch ? (
                      <div className="inline-flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Mismatch ({row.difference! > 0 ? `+${row.difference}` : row.difference})</span>
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Manual Verification</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs text-slate-900">
            <tr>
              <td className="py-3 px-4">TOTAL & PERCENTAGE</td>
              <td className="py-3 px-4">
                <span className="text-blue-900 text-sm">{comparison.totalEntered}</span>
                <span className="text-slate-500 font-normal ml-1">
                  ({comparison.percentageEntered}%)
                </span>
              </td>
              <td className="py-3 px-4">
                {comparison.totalExtracted ? (
                  <>
                    <span className="text-blue-900 text-sm">{comparison.totalExtracted}</span>
                    <span className="text-slate-500 font-normal ml-1">
                      ({comparison.percentageExtracted}%)
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 font-normal italic">Pending OCR verification</span>
                )}
              </td>
              <td className="py-3 px-4">
                {comparison.totalStatus === 'MATCH' ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Grand Total Verified
                  </span>
                ) : comparison.totalStatus === 'MISMATCH' ? (
                  <span className="text-rose-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Total Discrepancy
                  </span>
                ) : (
                  <span className="text-slate-500 font-normal">Requires Verification</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          <strong>Rule:</strong> Never invent marks when OCR text extraction fails. Discrepancies must be
          reviewed by admission officers.
        </span>
        {isStudentMode && hasUnsavedChanges && (
          <span className="text-blue-600 font-medium animate-pulse">Unsaved changes in table</span>
        )}
      </div>
    </div>
  );
};
