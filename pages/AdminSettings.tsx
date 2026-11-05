import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CourseEligibilityRule, DocumentRequirement } from '../types';
import { SlidersHorizontal, Check, Plus, Trash2, ArrowLeft, Save, Sparkles } from 'lucide-react';

interface AdminSettingsProps {
  setCurrentView: (view: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ setCurrentView }) => {
  const {
    courseRules,
    documentRequirements,
    updateCourseRules,
    updateDocumentRequirements,
  } = useApp();

  const [localRules, setLocalRules] = useState<CourseEligibilityRule[]>(courseRules);
  const [localReqs, setLocalReqs] = useState<DocumentRequirement[]>(documentRequirements);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleRequired = (index: number) => {
    const next = [...localReqs];
    next[index] = { ...next[index], isRequired: !next[index].isRequired };
    setLocalReqs(next);
  };

  const handlePercentageChange = (
    index: number,
    field: 'minPercentageGeneral' | 'minPercentageReserved',
    val: string
  ) => {
    const next = [...localRules];
    next[index] = { ...next[index], [field]: Number(val) || 0 };
    setLocalRules(next);
  };

  const handleSaveAll = () => {
    updateCourseRules(localRules);
    updateDocumentRequirements(localReqs);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Admission Rules &amp; Checklist Configuration
            </h1>
            <p className="text-xs text-slate-500">
              Set mandatory admission documents, quota cutoff rules, and eligibility standards.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configuration rules updated successfully! Changes take effect immediately.</span>
        </div>
      )}

      {/* Section 1: Configurable Document Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <h2 className="text-sm font-bold text-slate-900">1. Mandatory Document Checklist Rules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Documents marked as mandatory will block student completion until uploaded and validated.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {localReqs.map((req, idx) => (
            <div key={req.type} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{req.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    [{req.acceptedFormats.join(', ')}]
                  </span>
                </div>
                <p className="text-xs text-slate-500">{req.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleRequired(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    req.isRequired
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{req.isRequired ? 'Mandatory' : 'Optional / Quota'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Course Eligibility & Cutoff Criteria */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <h2 className="text-sm font-bold text-slate-900">2. Course Cutoff &amp; Eligibility Thresholds</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure minimum academic percentage and cut-off formulas for general and reserved seats.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Mandatory Subjects</th>
                <th className="py-3 px-4">General Min %</th>
                <th className="py-3 px-4">Reserved Min %</th>
                <th className="py-3 px-4">Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localRules.map((rule, idx) => (
                <tr key={rule.courseCode} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {rule.courseName}
                    <div className="text-[11px] text-slate-400 font-normal">{rule.department}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {rule.requiredSubjects.join(', ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="35"
                        max="100"
                        value={rule.minPercentageGeneral}
                        onChange={(e) => handlePercentageChange(idx, 'minPercentageGeneral', e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center bg-white"
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="35"
                        max="100"
                        value={rule.minPercentageReserved}
                        onChange={(e) => handlePercentageChange(idx, 'minPercentageReserved', e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center bg-white"
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono font-medium text-[11px]">
                      {rule.formula === 'Cutoff_200' ? 'Maths + (Phy+Chem)/2 (200 Max)' : 'Aggregate %'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
