/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { StudentRegisterPage } from './pages/StudentRegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminSettings } from './pages/AdminSettings';
import { ApplicationTrackingPage } from './pages/ApplicationTrackingPage';

const MainAppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [currentView, setCurrentView] = useState<string>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage setCurrentView={setCurrentView} />;
      case 'student-login':
        return <StudentLoginPage setCurrentView={setCurrentView} />;
      case 'student-register':
        return <StudentRegisterPage setCurrentView={setCurrentView} />;
      case 'admin-login':
        return <AdminLoginPage setCurrentView={setCurrentView} />;
      case 'student-dashboard':
        return <StudentDashboard setCurrentView={setCurrentView} />;
      case 'admin-dashboard':
        return <AdminDashboard setCurrentView={setCurrentView} />;
      case 'admin-settings':
        return <AdminSettings setCurrentView={setCurrentView} />;
      case 'tracking':
        return <ApplicationTrackingPage setCurrentView={setCurrentView} />;
      default:
        return <HomePage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-blue-900 text-white px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>
          <strong>SmartAdmit AI:</strong> Client-Side Tesseract.js OCR &amp; Biometric Quality Verification System.
          Run locally on laptop or modern browser with zero cloud database dependency.
        </span>
      </div>

      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1">
        {renderView()}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
