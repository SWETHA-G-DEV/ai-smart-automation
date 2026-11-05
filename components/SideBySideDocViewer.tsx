import React, { useState } from 'react';
import { UploadedDocument } from '../types';
import { X, ZoomIn, ZoomOut, Check, ArrowRight, Eye, FileText, Sparkles } from 'lucide-react';

interface SideBySideDocViewerProps {
  isOpen: boolean;
  onClose: () => void;
  primaryDoc?: UploadedDocument;
  doc?: UploadedDocument;
  secondaryDoc?: UploadedDocument;
  title?: string;
  onConfirmCorrect?: (chosenDocId: string) => void;
}

export const SideBySideDocViewer: React.FC<SideBySideDocViewerProps> = ({
  isOpen,
  onClose,
  primaryDoc: passedPrimaryDoc,
  doc,
  secondaryDoc,
  title = 'Side-by-Side Document Scrutiny View',
  onConfirmCorrect,
}) => {
  const primaryDoc = passedPrimaryDoc || doc;
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !primaryDoc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">{title}</h3>
              <p className="text-xs text-slate-300">
                Visual inspection &amp; side-by-side OCR extracted text alignment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 bg-slate-100">
          {/* Document 1 Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block truncate">{primaryDoc.title}</span>
                <span className="text-[11px] text-slate-500 font-mono truncate">{primaryDoc.fileName}</span>
              </div>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Document A
              </span>
            </div>

            {/* Document Image View */}
            <div className="p-4 bg-slate-50 flex items-center justify-center min-h-[300px] max-h-[420px] overflow-auto border-b border-slate-200">
              <img
                src={primaryDoc.fileDataUrl}
                alt={primaryDoc.fileName}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                className="max-h-[360px] object-contain rounded shadow transition-transform"
              />
            </div>

            {/* Extracted Text Details */}
            <div className="p-4 space-y-2 flex-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                OCR Extracted Values:
              </span>
              <div className="bg-slate-50 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-800 max-h-[140px] overflow-y-auto">
                <p>Candidate: {primaryDoc.ocrResult?.extractedName || 'N/A'}</p>
                <p>Register No: {primaryDoc.ocrResult?.extractedRegisterNo || 'N/A'}</p>
                {primaryDoc.ocrResult?.totalMarks && <p>Total Marks: {primaryDoc.ocrResult.totalMarks}</p>}
                {primaryDoc.photoQuality && <p>Photo Score: {primaryDoc.photoQuality.score}/100</p>}
              </div>
            </div>
          </div>

          {/* Document 2 Card (or fallback comparison) */}
          {secondaryDoc ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block truncate">{secondaryDoc.title}</span>
                  <span className="text-[11px] text-slate-500 font-mono truncate">{secondaryDoc.fileName}</span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Document B
                </span>
              </div>

              {/* Document Image View */}
              <div className="p-4 bg-slate-50 flex items-center justify-center min-h-[300px] max-h-[420px] overflow-auto border-b border-slate-200">
                <img
                  src={secondaryDoc.fileDataUrl}
                  alt={secondaryDoc.fileName}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                  className="max-h-[360px] object-contain rounded shadow transition-transform"
                />
              </div>

              {/* Extracted Text Details */}
              <div className="p-4 space-y-2 flex-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  OCR Extracted Values:
                </span>
                <div className="bg-slate-50 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-800 max-h-[140px] overflow-y-auto">
                  <p>Candidate: {secondaryDoc.ocrResult?.extractedName || 'N/A'}</p>
                  <p>Register No: {secondaryDoc.ocrResult?.extractedRegisterNo || 'N/A'}</p>
                  {secondaryDoc.ocrResult?.totalMarks && <p>Total Marks: {secondaryDoc.ocrResult.totalMarks}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300" />
              <h4 className="font-bold text-sm text-slate-800">No Secondary Document Uploaded</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Upload both 10th and 12th marksheets to view real-time side-by-side certificate verification.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Comparing: {primaryDoc.fileName} {secondaryDoc ? `vs ${secondaryDoc.fileName}` : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
          >
            Finished Scrutiny
          </button>
        </div>
      </div>
    </div>
  );
};
