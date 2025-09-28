import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, onAuthStateChange, USER_ROLES } from '../lib/supabase';
import { enforceAdminSecurity } from '../utils/adminSetup';

// 创建认证上下文
const AuthContext = createContext({});

// 自定义Hook用于使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 监听认证状态变化
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // 如果用户已登录，执行管理员安全检查
      if (session?.user) {
        try {
          await enforceAdminSecurity();
        } catch (error) {
          console.error('管理员安全检查失败:', error);
        }
      }
    });

    // 初始化时获取当前用户
    const initializeAuth = async () => {
      try {
        const { user } = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 清理订阅
    return () => subscription.unsubscribe();
  }, []);

  // 注册函数
  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // 登录函数
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      setUser(null);
      setSession(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // 重置密码函数
  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  // 更新用户信息函数
  const updateUser = async (updates) => {
    setLoading(true);
    try {
      const result = await authService.updateUser(updates);
      if (result.data) {
        setUser(result.data.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  // 获取用户角色
  const getUserRole = () => {
    return user?.user_metadata?.role || USER_ROLES.USER;
  };

  // 检查是否为管理员
  const isAdmin = () => {
    return getUserRole() === USER_ROLES.ADMIN;
  };

  // 检查是否已认证
  const isAuthenticated = () => {
    return !!user;
  };

  // 获取用户显示名称
  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || '用户';
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUser,
    getUserRole,
    isAdmin,
    isAuthenticated,
    getUserDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};