import React from 'react';
import { PhotoQualityResult } from '../types';
import { X, CheckCircle, AlertTriangle, AlertCircle, Camera, Sun, ZoomIn, Crop, RefreshCw } from 'lucide-react';

interface PhotoQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  quality: PhotoQualityResult;
  onUploadReplacement?: (file: File) => void;
}

export const PhotoQualityModal: React.FC<PhotoQualityModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  quality,
  onUploadReplacement,
}) => {
  if (!isOpen) return null;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadReplacement) {
      onUploadReplacement(e.target.files[0]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-rose-600 bg-rose-50 border-rose-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Photo Biometric Quality Audit</h3>
              <p className="text-xs text-slate-300">Automated passport photo compliance analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Photo preview container */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative border-4 border-slate-100 rounded-xl overflow-hidden shadow-md bg-slate-100 w-44 h-56 flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt="Candidate Passport Photo"
                  className="w-full h-full object-cover"
                />
                {quality.isBlurry && (
                  <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    BLURRY
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                {quality.resolution.width} × {quality.resolution.height} px • Ratio {quality.aspectRatio}:1
              </p>
            </div>

            {/* Quality Score Meter */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Overall Biometric Score
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                    {quality.score} <span className="text-base font-normal text-slate-500">/ 100</span>
                  </div>
                </div>
                <div
                  className={`px-3.5 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(
                    quality.score
                  )}`}
                >
                  {quality.score >= 80 ? 'Compliant' : quality.score >= 60 ? 'Borderline' : 'Action Required'}
                </div>
              </div>

              {/* Parameter Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sharpness</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-slate-900">{quality.blurScore}/100</span>
                    {quality.isBlurry ? (
                      <span className="text-rose-600 font-medium">Out of focus</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Sharp</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Brightness</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-slate-900">{quality.brightness}%</span>
                    {quality.isLowBrightness ? (
                      <span className="text-rose-600 font-medium">Too dark</span>
                    ) : quality.isOverExposed ? (
                      <span className="text-amber-600 font-medium">Overexposed</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Optimal</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Resolution</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-slate-900">{quality.resolution.width}px</span>
                    {quality.isLowResolution ? (
                      <span className="text-rose-600 font-medium">Low res (&lt;300px)</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">High res</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Crop className="w-3.5 h-3.5 text-purple-600" />
                    <span>Aspect Ratio</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-slate-900">{quality.aspectRatio}:1</span>
                    {quality.isExcessivelyCropped ? (
                      <span className="text-amber-600 font-medium">Cropped</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Standard 3:4</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Suggestions & Guidance */}
          <div className="border border-blue-100 rounded-xl bg-blue-50/70 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Biometric Recommendations & Improvement Tips</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {quality.suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
          />

          <p className="text-xs text-slate-500">
            Passport photos must have a plain background and clear facial visibility.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload Replacement Photo</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
