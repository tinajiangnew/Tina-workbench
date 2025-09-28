import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import AnimatedBackground from './components/ui/animated-background';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('welcome');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatedBackground />
      <div className="relative z-10">
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
      </div>
    </div>
  );
}

export default App;