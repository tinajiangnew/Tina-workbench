import React, { useState } from 'react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard } from '../ui/rainbow-card';
import { useAuth } from '../../contexts/AuthContext';
import UserProfile from '../Auth/UserProfile';

const Header = ({ onOpenSettings, showSettings }) => {
  const { user, signOut, getUserRole, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const userRole = getUserRole();
  const roleDisplayName = userRole === 'admin' ? '管理员' : '普通用户';

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
        
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin() ? 'bg-purple-500' : 'bg-blue-500'}`}>
              <span className="text-white font-bold text-sm">
                {isAdmin() ? '👑' : '👤'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-700 font-medium">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || '用户'}
              </span>
              <span className="text-xs text-gray-500">{roleDisplayName}</span>
            </div>
            <span className="text-gray-400 text-xs">▼</span>
          </div>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.name || '用户'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-purple-600 font-medium">{roleDisplayName}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setShowUserProfile(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                📝 个人资料
              </button>
              
              {isAdmin() && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // 这里可以添加管理员面板功能
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  🛠️ 管理面板
                </button>
              )}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  🚪 退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}
    </RainbowCard>
  );
};

export default Header;