import React from 'react';
import { ApplicationStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, FileSearch } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Verified':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          dot: 'bg-emerald-500',
        };
      case 'Submitted':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Clock className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          dot: 'bg-blue-500',
        };
      case 'Under Verification':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <FileSearch className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          dot: 'bg-indigo-500 animate-pulse',
        };
      case 'Correction Required':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          dot: 'bg-amber-500 animate-bounce',
        };
      case 'Manual Review Required':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <AlertCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          dot: 'bg-purple-500',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <Clock className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
          dot: 'bg-slate-500',
        };
    }
  };

  const current = getStyle();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${padding} ${current.bg}`}>
      {current.icon}
      <span>{status}</span>
    </span>
  );
};
