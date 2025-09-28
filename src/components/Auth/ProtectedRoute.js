import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';
import { RainbowCard } from '../ui/rainbow-card';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, getUserRole } = useAuth();

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <RainbowCard className="!p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </RainbowCard>
      </div>
    );
  }

  // 如果未认证，显示登录页面
  if (!isAuthenticated()) {
    return <AuthPage />;
  }

  // 如果需要特定角色权限
  if (requiredRole) {
    const userRole = getUserRole();
    const hasPermission = checkRolePermission(userRole, requiredRole);
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
          <RainbowCard className="!p-8 text-center max-w-md">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h2>
            <p className="text-gray-600 mb-6">
              您没有权限访问此页面。请联系管理员获取相应权限。
            </p>
            <div className="text-sm text-gray-500">
              当前角色: {getRoleDisplayName(userRole)}
              <br />
              需要角色: {getRoleDisplayName(requiredRole)}
            </div>
          </RainbowCard>
        </div>
      );
    }
  }

  // 认证通过，显示受保护的内容
  return children;
};

// 角色权限检查
const checkRolePermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'user': 1,
    'admin': 2
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// 角色显示名称
const getRoleDisplayName = (role) => {
  const roleNames = {
    'user': '普通用户',
    'admin': '管理员'
  };
  
  return roleNames[role] || role;
};

export default ProtectedRoute;