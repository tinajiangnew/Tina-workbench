import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SupabaseConfigError from './components/Auth/SupabaseConfigError';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import AnimatedBackground from './components/ui/animated-background';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('welcome');
  const [showSettings, setShowSettings] = useState(false);

  // 检查 Supabase 配置
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    return <SupabaseConfigError />;
  }

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AnimatedBackground />
          <div className="relative z-10">
            <ProtectedRoute>
              <Header 
                onOpenSettings={() => setShowSettings(true)}
                showSettings={showSettings}
              />
              <div className="flex h-[calc(100vh-4rem)]">
                <Sidebar 
                  activeModule={activeModule}
                  onModuleChange={setActiveModule}
                />
                <MainContent 
                  activeModule={activeModule}
                  showSettings={showSettings}
                  onCloseSettings={() => setShowSettings(false)}
                />
              </div>
            </ProtectedRoute>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;