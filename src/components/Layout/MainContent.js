import React from 'react';
import Notepad from '../Modules/Notepad';
import TodoList from '../Modules/TodoList';
import AIChat from '../Modules/AIChat';
import PomodoroTimer from '../Modules/PomodoroTimer';
import TaskManager from '../Modules/TaskManager';
import ProgressMonitor from '../Modules/ProgressMonitor';
import { RainbowCard } from '../ui/rainbow-card';

const MainContent = ({ activeModule }) => {
  const renderContent = () => {
    switch (activeModule) {
      case 'welcome':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              🎉 欢迎使用个人工作台！
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              这是一个集成化、轻量级、高颜值的个人工作台，整合了记事本、待办事项、AI助手、番茄钟等功能。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  📝 <span className="ml-2">记事本模块</span>
                </h3>
                <p className="text-gray-600">支持Markdown编辑、自动保存、笔记管理</p>
                <div className="mt-3 text-sm text-primary-600">✅ 已完成</div>
              </div>
              
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  ✅ <span className="ml-2">待办事项</span>
                </h3>
                <p className="text-gray-600">任务增删改查、状态切换、筛选功能</p>
                <div className="mt-3 text-sm text-primary-600">✅ 已完成</div>
              </div>
              
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  🤖 <span className="ml-2">AI 对话</span>
                </h3>
                <p className="text-gray-600">聊天界面、API Key配置、流式响应</p>
                <div className="mt-3 text-sm text-primary-600">✅ 已完成</div>
              </div>
              
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  🍅 <span className="ml-2">番茄钟</span>
                </h3>
                <p className="text-gray-600">计时器、状态管理、通知提醒</p>
                <div className="mt-3 text-sm text-primary-600">✅ 已完成</div>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                🎉 所有功能模块已完成！点击左侧导航栏开始使用
              </p>
            </div>
          </div>
        );
      case 'notes':
        return <Notepad />;
      case 'todos':
        return <TodoList />;
      case 'tasks':
        return <TaskManager />;
      case 'progress':
        return <ProgressMonitor />;
      case 'chat':
        return <AIChat />;
      case 'pomodoro':
        return <PomodoroTimer />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">选择功能模块</h2>
            <p className="text-gray-600">请从左侧导航栏选择要使用的功能</p>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full">
        {activeModule === 'notes' || activeModule === 'chat' ? (
          <RainbowCard className="h-full overflow-hidden">
            {renderContent()}
          </RainbowCard>
        ) : (
          <div className="h-full p-6">
            <RainbowCard className="h-full overflow-y-auto">
              {renderContent()}
            </RainbowCard>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;