import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { DEMO_ADMIN } from '../data/demoData';

interface AdminLoginPageProps {
  setCurrentView: (view: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ setCurrentView }) => {
  const { loginAdmin } = useApp();
  const [email, setEmail] = useState('admin@smartadmit.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ok = loginAdmin(email, password);
    if (ok) {
      setCurrentView('admin-dashboard');
    } else {
      setError('Invalid admin credentials. Use admin@smartadmit.edu / admin123');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-900 text-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">College Administration Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Secure verification console for admission deans and verifiers.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Passkey</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Authenticate to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">Pre-filled Demo Credentials:</p>
          <p className="font-mono text-[11px]">Email: {DEMO_ADMIN.email}</p>
          <p className="font-mono text-[11px]">Password: admin123</p>
        </div>
      </div>
    </div>
  );
};
