import React, { useRef, useState } from 'react';
import { DocumentRequirement, DocumentType, UploadedDocument } from '../types';
import { useApp } from '../context/AppContext';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Trash2,
  Eye,
  Camera,
  Sparkles,
  Loader2,
  FileText,
  Copy,
} from 'lucide-react';
import { PhotoQualityModal } from './PhotoQualityModal';

interface DocumentUploadCardProps {
  requirement: DocumentRequirement;
  uploadedDoc?: UploadedDocument;
  studentId: string;
  isStudentView?: boolean;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  requirement,
  uploadedDoc,
  studentId,
  isStudentView = true,
}) => {
  const { uploadDocument, removeDocument, loadSampleDocumentForTesting, isOcrProcessing, ocrProgress } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleFile = async (file: File) => {
    try {
      setUploadLoading(true);
      await uploadDocument(file, requirement.type, studentId);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isUploaded = !!uploadedDoc;
  const isPhoto = requirement.type === 'photo';
  const isMarksheet = requirement.type === 'marksheet_12' || requirement.type === 'marksheet_10';

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isUploaded
          ? uploadedDoc.isDuplicate
            ? 'border-amber-300 bg-amber-50/20'
            : uploadedDoc.verificationStatus === 'Correction Required'
            ? 'border-rose-300 bg-rose-50/20'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
          : 'border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-400'
      }`}
    >
      {/* Top Tag & Requirement status */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm">{requirement.title}</span>
          {requirement.isRequired ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Mandatory
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Optional / Quota
            </span>
          )}
        </div>

        {isUploaded ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                uploadedDoc.verificationStatus === 'Valid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : uploadedDoc.verificationStatus === 'Correction Required'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {uploadedDoc.verificationStatus}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Not Uploaded</span>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs text-slate-500 mb-4">{requirement.description}</p>

        {/* Duplicate Hash Warning if flagged */}
        {uploadedDoc?.isDuplicate && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Duplicate Upload Detected (SHA-256 Match)</p>
              <p className="text-[11px] mt-0.5 text-amber-700">
                {uploadedDoc.duplicateWarning ||
                  'The exact same document file was uploaded under another category. Please confirm you uploaded the distinct certificate.'}
              </p>
            </div>
          </div>
        )}

        {/* Uploaded Document Card Details */}
        {isUploaded ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              {/* Thumbnail or icon */}
              <div
                onClick={() => setIsPreviewModalOpen(true)}
                className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 hover:opacity-85 transition"
              >
                {uploadedDoc.mimeType.startsWith('image/') || uploadedDoc.fileDataUrl.startsWith('data:image') ? (
                  <img
                    src={uploadedDoc.fileDataUrl}
                    alt={uploadedDoc.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-blue-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate" title={uploadedDoc.fileName}>
                  {uploadedDoc.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span>{(uploadedDoc.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{uploadedDoc.uploadDate}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono truncate">
                  <Copy className="w-2.5 h-2.5 shrink-0" />
                  <span>SHA: {uploadedDoc.fileHash.substring(0, 16)}...</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Preview Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {isStudentView && (
                  <button
                    type="button"
                    onClick={() => removeDocument(uploadedDoc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove and Re-upload"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Photo Quality Pill */}
            {isPhoto && uploadedDoc.photoQuality && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-semibold text-blue-900">
                      Photo Biometric Score: {uploadedDoc.photoQuality.score}/100
                    </span>
                    <p className="text-[11px] text-blue-700">
                      {uploadedDoc.photoQuality.isBlurry
                        ? 'Blurry photograph detected'
                        : uploadedDoc.photoQuality.isLowBrightness
                        ? 'Lighting is too dark'
                        : 'Face clarity & dimensions passed'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition shadow-2xs"
                >
                  Inspect Audit
                </button>
              </div>
            )}

            {/* OCR Processing Indicator or Results */}
            {isMarksheet && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Tesseract Marksheet OCR
                  </span>
                  {uploadedDoc.ocrResult ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Extracted ({uploadedDoc.ocrResult.confidence}% Conf)
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Ready</span>
                  )}
                </div>

                {uploadedDoc.ocrResult?.extractedName && (
                  <p className="text-[11px] text-slate-600">
                    Candidate: <strong>{uploadedDoc.ocrResult.extractedName}</strong> (Reg:{' '}
                    {uploadedDoc.ocrResult.extractedRegisterNo || 'N/A'})
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty / Upload State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept={requirement.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(',')}
              className="hidden"
            />

            {uploadLoading || (isOcrProcessing && isMarksheet) ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs font-semibold text-blue-900">
                  {ocrProgress ? `${ocrProgress.status} (${ocrProgress.progress}%)` : 'Analyzing Document...'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800">
                    Click to browse or drop file here
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Accepted: {requirement.acceptedFormats.join(', ')} (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Test Demo Presets - Very handy for local testing without files! */}
        {isStudentView && !isUploaded && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-medium mr-1">Quick Sample:</span>
            <button
              type="button"
              onClick={() => loadSampleDocumentForTesting(studentId, requirement.type, 'clear')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded font-medium transition"
            >
              Clear Sample
            </button>
            {isPhoto && (
              <button
                type="button"
                onClick={() => loadSampleDocumentForTesting(studentId, requirement.type, 'blurry')}
                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-medium transition"
              >
                Blurry Sample
              </button>
            )}
            {requirement.type === 'marksheet_12' && (
              <button
                type="button"
                onClick={() => loadSampleDocumentForTesting(studentId, requirement.type, 'mismatch')}
                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded font-medium transition"
              >
                Mismatch Sample
              </button>
            )}
          </div>
        )}
      </div>

      {/* Photo Quality Modal */}
      {isPhoto && uploadedDoc?.photoQuality && (
        <PhotoQualityModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          photoUrl={uploadedDoc.fileDataUrl}
          quality={uploadedDoc.photoQuality}
          onUploadReplacement={handleFile}
        />
      )}

      {/* Generic Preview Modal */}
      {isPreviewModalOpen && uploadedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{uploadedDoc.fileName}</h4>
                <p className="text-[11px] text-slate-300 font-mono">
                  SHA-256: {uploadedDoc.fileHash}
                </p>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[300px]">
              {uploadedDoc.fileDataUrl.startsWith('data:image') || uploadedDoc.mimeType.startsWith('image') ? (
                <img
                  src={uploadedDoc.fileDataUrl}
                  alt={uploadedDoc.fileName}
                  className="max-h-[70vh] max-w-full rounded shadow object-contain"
                />
              ) : (
                <iframe
                  src={uploadedDoc.fileDataUrl}
                  title="PDF Preview"
                  className="w-full h-[65vh] border rounded bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
