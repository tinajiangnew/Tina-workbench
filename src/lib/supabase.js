import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 检查必需的环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.');
  console.error('Required variables: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY');
}

// 创建Supabase客户端
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null;

// 用户角色常量
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// 权限检查函数
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    [USER_ROLES.USER]: 1,
    [USER_ROLES.ADMIN]: 2
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// 认证相关函数
export const authService = {
  // 注册用户
  async signUp(email, password, userData = {}) {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please check your environment variables.' } 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            role: userData.role || USER_ROLES.USER,
            ...userData
          }
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 登录用户
  async signIn(email, password) {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Supabase not configured. Please check your environment variables.' } 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 登出用户
  async signOut() {
    if (!supabase) {
      return { error: { message: 'Supabase not configured.' } };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    if (!supabase) {
      return { user: null, error: { message: 'Supabase not configured.' } };
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // 重置密码
  async resetPassword(email) {
    if (!supabase) {
      return { error: { message: 'Supabase not configured.' } };
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // 更新用户信息
  async updateUser(updates) {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured.' } };
    }
    
    try {
      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// 监听认证状态变化
export const onAuthStateChange = (callback) => {
  if (!supabase) {
    console.error('Supabase not configured. Cannot listen to auth state changes.');
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
};