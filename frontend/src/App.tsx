import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SketchGenerator } from './pages/SketchGenerator';
import { TextDescription } from './pages/TextDescription';
import { VoiceSketch } from './pages/VoiceSketch';
import { FaceRecognition } from './pages/FaceRecognition';
import { RealTimeCCTV } from './pages/RealTimeCCTV';
import { SuspectDatabase } from './pages/SuspectDatabase';
import { RecognitionHistory } from './pages/RecognitionHistory';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { FacialAttributes } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [probeImage, setProbeImage] = useState<string | undefined>(undefined);
  const [sketchAttributes, setSketchAttributes] = useState<FacialAttributes | undefined>(undefined);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleSendToRecognition = (imageUrl: string) => {
    setProbeImage(imageUrl);
    setCurrentPage('recognition');
  };

  const handleSendToSketch = (attrs: FacialAttributes) => {
    setSketchAttributes(attrs);
    setCurrentPage('sketch');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'sketch':
        return (
          <SketchGenerator 
            onNavigate={setCurrentPage} 
            onSendToRecognition={handleSendToRecognition}
            initialAttributes={sketchAttributes}
          />
        );
      case 'text-desc':
        return (
          <TextDescription 
            onNavigate={setCurrentPage}
            onSendToSketch={handleSendToSketch}
            onSendToRecognition={handleSendToRecognition}
          />
        );
      case 'voice-sketch':
        return (
          <VoiceSketch 
            onNavigate={setCurrentPage}
            onSendToSketch={handleSendToSketch}
            onSendToRecognition={handleSendToRecognition}
          />
        );
      case 'recognition':
        return <FaceRecognition onNavigate={setCurrentPage} initialQueryImage={probeImage} />;
      case 'cctv':
        return <RealTimeCCTV onNavigate={setCurrentPage} />;
      case 'database':
        return <SuspectDatabase onNavigate={setCurrentPage} />;
      case 'history':
        return <RecognitionHistory onNavigate={setCurrentPage} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header currentPage={currentPage} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
