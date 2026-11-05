import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  LogOut,
  ChevronDown,
  RotateCcw,
  Sparkles,
  FileCheck,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { currentUser, switchDemoUser, logout, resetAllData, students } = useApp();
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-800 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">SmartAdmit</span>
                <span className="font-bold text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Admission Document &amp; Marks Validation
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-2 rounded-lg transition ${
                currentView === 'home' ? 'text-blue-700 bg-blue-50' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className={`px-3 py-2 rounded-lg transition ${
                currentView === 'tracking' ? 'text-blue-700 bg-blue-50' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Track Application
            </button>

            {currentUser.role === 'student' && (
              <button
                onClick={() => setCurrentView('student-dashboard')}
                className={`px-3 py-2 rounded-lg transition ${
                  currentView === 'student-dashboard'
                    ? 'text-blue-700 bg-blue-50'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Dashboard
              </button>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className={`px-3 py-2 rounded-lg transition ${
                    currentView === 'admin-dashboard'
                      ? 'text-blue-700 bg-blue-50'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Portal
                </button>
                <button
                  onClick={() => setCurrentView('admin-settings')}
                  className={`px-3 py-2 rounded-lg transition ${
                    currentView === 'admin-settings'
                      ? 'text-blue-700 bg-blue-50'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Cutoff &amp; Checklist Rules
                </button>
              </>
            )}
          </nav>

          {/* Right Section: Quick Demo Account Switcher & Auth */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition"
                title="Switch demo student or admin profile instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Switch Demo Profile</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isDemoDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                  onClick={() => setIsDemoDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    College Administration
                  </div>
                  <button
                    onClick={() => {
                      switchDemoUser('admin');
                      setCurrentView('admin-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-[10px]">
                        ADM
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Dr. S. K. Subramanian</p>
                        <p className="text-[10px] text-slate-500">Dean of Admissions</p>
                      </div>
                    </div>
                    {currentUser.role === 'admin' && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Demo Students (Pre-configured Test Cases)
                  </div>

                  {students.map((std) => (
                    <button
                      key={std.id}
                      onClick={() => {
                        switchDemoUser('student', std.id);
                        setCurrentView('student-dashboard');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{std.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {std.courseApplied.split(' ')[0]} •{' '}
                          <span
                            className={
                              std.status === 'Verified'
                                ? 'text-emerald-600 font-semibold'
                                : std.status === 'Correction Required'
                                ? 'text-rose-600 font-semibold'
                                : 'text-blue-600 font-semibold'
                            }
                          >
                            {std.status}
                          </span>
                        </p>
                      </div>
                      {currentUser.role === 'student' && currentUser.student?.id === std.id && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </button>
                  ))}

                  <div className="my-1 border-t border-slate-100"></div>

                  <button
                    onClick={resetAllData}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 text-xs font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Demo Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile Pill or Login Buttons */}
            {currentUser.role === 'guest' ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentView('student-login')}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                >
                  Student Login
                </button>
                <button
                  onClick={() => setCurrentView('student-register')}
                  className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition border border-emerald-200 cursor-pointer"
                >
                  Register
                </button>
                <button
                  onClick={() => setCurrentView('admin-login')}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white rounded-lg shadow-xs transition cursor-pointer"
                >
                  Admin
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  onClick={() =>
                    setCurrentView(currentUser.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
                  }
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100 transition"
                  title="Go to Dashboard"
                >
                  {currentUser.role === 'admin' ? (
                    <UserCheck className="w-4 h-4 text-blue-900" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-blue-700" />
                  )}
                  <div className="text-left hidden sm:block max-w-[130px]">
                    <p className="text-xs font-bold text-blue-950 leading-tight truncate">
                      {currentUser.role === 'admin'
                        ? currentUser.admin?.name
                        : currentUser.student?.name}
                    </p>
                    <p className="text-[10px] text-blue-700 uppercase font-semibold">
                      {currentUser.role === 'student' ? 'Student Portal' : 'Admin'}
                    </p>
                  </div>
                </div>

                {/* Visible Logout Button (Requirement 7) */}
                <button
                  onClick={() => {
                    logout();
                    setCurrentView('home');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
                  title="Sign Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
