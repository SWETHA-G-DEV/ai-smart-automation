import React from 'react';
import { EligibilityEvaluation } from '../types';
import { Check, X, HelpCircle } from 'lucide-react';

interface EligibilityBadgeProps {
  evaluation: EligibilityEvaluation;
  showScore?: boolean;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ evaluation, showScore = true }) => {
  const isEligible = evaluation.status === 'Eligible';
  const isReview = evaluation.status === 'Needs Manual Review';

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          isEligible
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : isReview
            ? 'bg-purple-50 text-purple-800 border-purple-300'
            : 'bg-rose-50 text-rose-800 border-rose-300'
        }`}
      >
        {isEligible ? (
          <Check className="w-3.5 h-3.5" />
        ) : isReview ? (
          <HelpCircle className="w-3.5 h-3.5" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
        <span>{evaluation.status}</span>
      </span>

      {showScore && (
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Cutoff: <strong className="text-blue-900">{evaluation.score}</strong> / 200
        </span>
      )}
    </div>
  );
};
