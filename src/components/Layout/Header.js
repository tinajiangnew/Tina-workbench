import React from 'react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard } from '../ui/rainbow-card';

const Header = ({ onOpenSettings }) => {
  return (
    <RainbowCard className="border-b border-gray-200 h-16 flex items-center justify-between px-6 !rounded-none !border-l-0 !border-r-0 !border-t-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">个人工作台</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <RainbowButton 
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ⚙️
        </RainbowButton>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">👤</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-700 font-medium">访客用户</span>
            <span className="text-xs text-gray-500">演示模式</span>
          </div>
        </div>
      </div>
    </RainbowCard>
  );
};

export default Header;