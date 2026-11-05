import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Info,
} from 'lucide-react';

interface StudentLoginPageProps {
  setCurrentView: (view: string) => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ setCurrentView }) => {
  const { loginStudent, switchDemoUser, students } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setLoading(true);
    const result = loginStudent(email, password);
    setLoading(false);

    if (result.success && result.student) {
      setSuccessMsg(`Welcome back, ${result.student.name}! Loading your dashboard...`);
      setTimeout(() => {
        setCurrentView('student-dashboard');
      }, 500);
    } else {
      setError(result.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoSelect = (stdId: string) => {
    setError('');
    setSuccessMsg('Loading demo student profile...');
    switchDemoUser('student', stdId);
    setTimeout(() => {
      setCurrentView('student-dashboard');
    }, 400);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your admission application, upload certificates, and track document validation.
          </p>
        </div>

        {/* Demo Storage Disclaimer Notice (Requirement 10) */}
        <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Demonstration Storage Notice:</strong> Student accounts and application
            data are saved locally in browser LocalStorage. Not intended for secure production authentication.
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="e.g. kavitha@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password *</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your admission password"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Application'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Prominent "New Student? Create Account" Button (Requirement 1) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-center mb-2">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              First time applying?
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('student-register')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer group"
          >
            <UserPlus className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span>New Student? Create Account</span>
          </button>
        </div>

        {/* 1-Click Fast Demo Accounts for Instant Evaluation */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Pre-configured Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoSelect('std-01')}
              className="p-2 border border-slate-200 rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition"
            >
              <div className="font-bold text-slate-900 truncate">Kavitha Raman</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Verified Student</div>
              <div className="text-[9px] text-slate-400 font-mono">kavitha@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('std-02')}
              className="p-2 border border-slate-200 rounded-lg text-left hover:bg-amber-50 hover:border-amber-300 transition"
            >
              <div className="font-bold text-slate-900 truncate">Rahul Sharma</div>
              <div className="text-[10px] text-amber-600 font-semibold">Correction Needed</div>
              <div className="text-[9px] text-slate-400 font-mono">rahul@gmail.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
