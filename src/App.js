import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import AnimatedBackground from './components/ui/animated-background';

function App() {
  const [activeModule, setActiveModule] = useState('welcome');
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <AnimatedBackground>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* 顶部导航栏 */}
        <Header 
          onOpenSettings={() => setShowSettings(true)}
          onCloseSettings={() => setShowSettings(false)}
          showSettings={showSettings}
        />
        
        <div className="flex h-[calc(100vh-4rem)]">
          {/* 左侧边栏 */}
          <Sidebar 
            activeModule={activeModule}
            onModuleChange={setActiveModule}
          />
          
          {/* 主要内容区域 */}
          <MainContent activeModule={activeModule} />
        </div>
      </div>
    </AnimatedBackground>
  );
}

export default App;