import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  Phone,
  FileSpreadsheet,
  BookOpen,
  Info,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentRegisterPageProps {
  setCurrentView: (view: string) => void;
}

export const StudentRegisterPage: React.FC<StudentRegisterPageProps> = ({ setCurrentView }) => {
  const { registerStudent, courseRules } = useApp();

  // The 7 Required Fields per instructions:
  // 1. Full name, 2. Email address, 3. Mobile number, 4. Register number, 5. Password, 6. Confirm password, 7. Course selection
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    registerNumber: '',
    password: '',
    confirmPassword: '',
    courseApplied: courseRules[0]?.courseName || 'B.E. Computer Science & Engineering',
    quota: 'General' as const,
    boardName: 'Tamil Nadu State Board',
    passingYear: '2024',
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // 1. Full name
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Full name must be at least 3 characters.';
    }

    // 2. Email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Mobile number (10 digits)
    const mobileDigits = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required.';
    } else if (mobileDigits.length !== 10) {
      errors.mobile = 'Mobile number must be a valid 10-digit phone number.';
    }

    // 4. Register number
    if (!formData.registerNumber.trim()) {
      errors.registerNumber = '12th Board Registration number is required.';
    } else if (formData.registerNumber.trim().length < 4) {
      errors.registerNumber = 'Register number must be at least 4 characters.';
    }

    // 5. Password
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // 6. Confirm Password (must match!)
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please re-enter.';
    }

    // 7. Course selection
    if (!formData.courseApplied || !formData.courseApplied.trim()) {
      errors.courseApplied = 'Please select a course.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMsg('');

    if (!validateForm()) {
      setGeneralError('Please correct the highlighted errors in the registration form.');
      return;
    }

    setLoading(true);

    const result = registerStudent({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      mobile: formData.mobile.trim(),
      registerNumber: formData.registerNumber.trim().toUpperCase(),
      courseApplied: formData.courseApplied,
      quota: formData.quota,
      boardName: formData.boardName,
      passingYear: formData.passingYear,
      subjects: [
        { name: 'Language / Tamil', maxMarks: 100, enteredMarks: 90 },
        { name: 'English', maxMarks: 100, enteredMarks: 85 },
        { name: 'Mathematics', maxMarks: 100, enteredMarks: 92 },
        { name: 'Physics', maxMarks: 100, enteredMarks: 88 },
        { name: 'Chemistry', maxMarks: 100, enteredMarks: 86 },
        { name: 'Computer Science', maxMarks: 100, enteredMarks: 94 },
      ],
      totalEnteredMarks: 545,
      enteredPercentage: 90.83,
    });

    setLoading(false);

    if (result.success && result.student) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      setSuccessMsg(`Registration successful! Application ID: ${result.student.applicationId}. Redirecting to your dashboard...`);
      setTimeout(() => {
        setCurrentView('student-dashboard');
      }, 700);
    } else {
      setGeneralError(result.error || 'Failed to complete registration. Please check your details.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-xs">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Student Account Registration</h2>
              <p className="text-xs text-slate-300">
                Enroll for automated admission document validation and counseling
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 hidden sm:inline">
            Status: Submitted
          </span>
        </div>

        {/* Demo Storage Notice (Requirement 10) */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Demonstration Only:</strong> Accounts, credentials, and uploaded
            documents are saved in browser LocalStorage. This prototype is for testing and demonstration, not
            secure production authentication.
          </div>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="m-6 mb-0 p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{generalError}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="m-6 mb-0 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>Required Registration Fields</span>
              <span className="text-rose-500 font-normal">* All 7 fields required</span>
            </div>

            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Full Name (as per 10th Marksheet) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                  placeholder="e.g. S. Harish Kumar"
                  className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden transition ${
                    fieldErrors.name
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.name}</p>
              )}
            </div>

            {/* Field 2: Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder="e.g. harish@gmail.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden transition ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Field 3: Mobile Number & Field 4: Register Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => {
                      setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') });
                      if (fieldErrors.mobile) setFieldErrors({ ...fieldErrors, mobile: '' });
                    }}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden transition ${
                      fieldErrors.mobile
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.mobile && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.mobile}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. 12th Board Register Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.registerNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, registerNumber: e.target.value });
                      if (fieldErrors.registerNumber) setFieldErrors({ ...fieldErrors, registerNumber: '' });
                    }}
                    placeholder="e.g. 7112099"
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden font-mono uppercase transition ${
                      fieldErrors.registerNumber
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.registerNumber && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.registerNumber}</p>
                )}
              </div>
            </div>

            {/* Field 5: Password & Field 6: Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder="At least 6 characters"
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden transition ${
                      fieldErrors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6. Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    placeholder="Re-enter password"
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden transition ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Field 7: Course Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                7. Course Selection <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  required
                  value={formData.courseApplied}
                  onChange={(e) => {
                    setFormData({ ...formData, courseApplied: e.target.value });
                    if (fieldErrors.courseApplied) setFieldErrors({ ...fieldErrors, courseApplied: '' });
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:outline-hidden bg-white transition ${
                    fieldErrors.courseApplied
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                >
                  {courseRules.map((c) => (
                    <option key={c.courseCode} value={c.courseName}>
                      {c.courseName} — {c.department}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.courseApplied && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.courseApplied}</p>
              )}
            </div>

            {/* Optional Quota & Board details */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 mb-3">
                Reservation &amp; Board Category
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quota / Category</label>
                  <select
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
                  >
                    <option value="General">Open Competition / General (OC)</option>
                    <option value="BC">Backward Class (BC)</option>
                    <option value="MBC">Most Backward Class (MBC / DNC)</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="Sports / Special">Sports / Differently Abled Quota</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifying School Board</label>
                  <select
                    value={formData.boardName}
                    onChange={(e) => setFormData({ ...formData, boardName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
                  >
                    <option value="Tamil Nadu State Board">Tamil Nadu Higher Secondary (State Board)</option>
                    <option value="Central Board of Secondary Education (CBSE)">CBSE</option>
                    <option value="Council for Indian School Certificate Examinations (ICSE)">ICSE</option>
                    <option value="Other Recognized State Board">Other Recognized State Board</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('student-login')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition"
            >
              Already registered? Sign In to Portal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Registration & Open Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
