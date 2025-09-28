import React from 'react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard } from '../ui/rainbow-card';

const Sidebar = ({ activeModule, onModuleChange }) => {
  const menuItems = [
    {
      id: 'welcome',
      name: '欢迎页面',
      icon: '🏠',
      description: '工作台首页'
    },
    {
      id: 'notes',
      name: '记事本',
      icon: '📝',
      description: 'Markdown笔记'
    },
    {
      id: 'todos',
      name: '待办事项',
      icon: '✅',
      description: '任务管理'
    },
    {
      id: 'tasks',
      name: '任务管理',
      icon: '📋',
      description: '项目任务/负责人/截止'
    },
    {
      id: 'progress',
      name: '进度监控',
      icon: '📈',
      description: '统计/逾期/趋势'
    },
    {
      id: 'chat',
      name: 'AI对话',
      icon: '🤖',
      description: 'AI助手'
    },
    {
      id: 'pomodoro',
      name: '番茄钟',
      icon: '🍅',
      description: '专注计时'
    },
    {
      id: 'aurora',
      name: 'Aurora背景',
      icon: '🌌',
      description: '极光背景效果'
    }
  ];

  return (
    <RainbowCard className="w-64 h-full flex flex-col !rounded-none !border-r-0 !border-l-0 !border-t-0">
      {/* 侧边栏标题 */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">功能模块</h2>
        <p className="text-sm text-gray-500 mt-1">选择要使用的工具</p>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <RainbowButton
            key={item.id}
            onClick={() => onModuleChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
              activeModule === item.id
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500 group-hover:text-gray-600">
                {item.description}
              </div>
            </div>
            {activeModule === item.id && (
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            )}
          </RainbowButton>
        ))}
      </nav>
      
      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          个人工作台 v1.0
        </div>
      </div>
    </RainbowCard>
  );
};

export default Sidebar;