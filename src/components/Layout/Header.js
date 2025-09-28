import React from 'react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard } from '../ui/rainbow-card';
import UserProfile from '../Auth/UserProfile';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onOpenSettings }) => {
  const { tenant } = useAuth();
  
  return (
    <RainbowCard className="border-b border-gray-200 h-16 flex items-center justify-between px-6 !rounded-none !border-l-0 !border-r-0 !border-t-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {tenant?.name || '个人工作台'}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <RainbowButton 
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ⚙️
        </RainbowButton>
        
        <UserProfile />
      </div>
    </RainbowCard>
  );
};

export default Header;