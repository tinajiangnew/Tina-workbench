# 用户认证系统设置指南

## 概述

本项目已集成完整的用户认证系统，包括用户注册、登录、权限管理和管理员功能。认证系统基于 Supabase 构建，提供安全可靠的用户管理服务。

## 功能特性

### 🔐 用户认证
- ✅ 用户注册（邮箱验证）
- ✅ 用户登录/登出
- ✅ 密码重置
- ✅ 用户信息管理
- ✅ 会话持久化

### 👥 权限管理
- ✅ 基于角色的访问控制（RBAC）
- ✅ 普通用户权限
- ✅ 管理员权限
- ✅ 受保护路由

### 🛠 管理员功能
- ✅ 用户列表管理
- ✅ 用户角色修改
- ✅ 用户删除
- ✅ 系统监控

## 快速开始

### 1. Supabase 配置

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 在项目设置 > API 中获取以下信息：
   - Project URL
   - anon public key

### 2. 环境变量配置

编辑 `.env.local` 文件，填入您的 Supabase 配置：

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 数据库设置

在 Supabase SQL 编辑器中执行以下 SQL 来设置用户表：

```sql
-- 创建用户角色枚举
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 扩展 auth.users 表的元数据
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user',
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 创建用户配置文件表
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全性
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和更新自己的配置文件
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 管理员可以查看所有用户配置文件
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 创建触发器函数：注册时自动创建用户配置文件
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. 启动应用

```bash
npm start
```

应用将在 http://localhost:3000 启动。

## 使用说明

### 用户注册和登录

1. 访问应用首页
2. 如果未登录，系统会自动跳转到认证页面
3. 可以选择注册新账户或登录现有账户
4. 注册时需要提供：
   - 姓名
   - 邮箱地址
   - 密码（至少6位）
   - 确认密码

### 权限系统

#### 普通用户权限
- 访问所有基础功能模块
- 查看和编辑个人资料
- 使用记事本、待办事项等功能

#### 管理员权限
- 拥有普通用户的所有权限
- 访问管理员面板
- 管理所有用户账户
- 修改用户角色
- 删除用户账户

### 创建管理员账户

1. 首先注册一个普通用户账户
2. 在 Supabase Dashboard 中，进入 Table Editor
3. 找到 `user_profiles` 表
4. 将目标用户的 `role` 字段修改为 `admin`

## 组件结构

```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthPage.js          # 认证页面容器
│   │   ├── LoginForm.js         # 登录表单
│   │   ├── RegisterForm.js      # 注册表单
│   │   ├── ProtectedRoute.js    # 受保护路由
│   │   └── UserProfile.js       # 用户资料组件
│   ├── Admin/
│   │   └── AdminPanel.js        # 管理员面板
│   └── Layout/
│       ├── Header.js            # 头部（含用户菜单）
│       ├── Sidebar.js           # 侧边栏（含管理员入口）
│       └── MainContent.js       # 主内容区
├── contexts/
│   └── AuthContext.js           # 认证上下文
└── utils/
    └── supabase.js              # Supabase 客户端配置
```

## API 参考

### AuthContext Hook

```javascript
import { useAuth } from '../contexts/AuthContext';

const {
  user,           // 当前用户信息
  loading,        // 加载状态
  signUp,         // 注册函数
  signIn,         // 登录函数
  signOut,        // 登出函数
  resetPassword,  // 重置密码
  updateUserInfo, // 更新用户信息
  getUserRole,    // 获取用户角色
  isAdmin         // 是否为管理员
} = useAuth();
```

### 受保护路由

```javascript
import ProtectedRoute from '../components/Auth/ProtectedRoute';

// 普通用户权限
<ProtectedRoute requiredRole="user">
  <YourComponent />
</ProtectedRoute>

// 管理员权限
<ProtectedRoute requiredRole="admin">
  <AdminComponent />
</ProtectedRoute>
```

## 故障排除

### 常见问题

1. **注册后无法登录**
   - **原因**：Supabase 配置不正确或使用了占位符密钥
   - **解决方案**：
     - 检查 `.env.local` 文件中的 `REACT_APP_SUPABASE_ANON_KEY` 是否为真实密钥
     - 确保不是 `your-anon-key` 占位符
     - 从 Supabase Dashboard > 项目设置 > API 获取正确的密钥
     - 配置完成后重启开发服务器

2. **显示 "Supabase 配置错误" 页面**
   - **原因**：环境变量未正确配置
   - **解决方案**：
     - 确保 `.env.local` 文件存在且包含正确的配置
     - 检查环境变量名称是否正确（必须以 `REACT_APP_` 开头）
     - 重启开发服务器使配置生效

3. **无法连接到 Supabase**
   - 检查环境变量是否正确配置
   - 确认 Supabase 项目状态正常
   - 验证 API 密钥是否有效

4. **用户注册失败**
   - 检查邮箱格式是否正确
   - 确认密码符合要求（至少6位）
   - 查看浏览器控制台错误信息

5. **权限问题**
   - 确认用户角色设置正确
   - 检查数据库策略配置
   - 验证 RLS 策略是否启用

6. **环境变量问题**
   - 确认 `.env.local` 文件配置正确
   - 重启开发服务器
   - 检查变量名是否以 `REACT_APP_` 开头

### 调试技巧

1. 打开浏览器开发者工具
2. 查看 Console 标签页的错误信息
3. 检查 Network 标签页的 API 请求
4. 在 Supabase Dashboard 中查看认证日志

## 安全注意事项

1. **环境变量安全**
   - 不要将 `.env.local` 文件提交到版本控制
   - 生产环境使用环境变量而非文件配置

2. **密码安全**
   - 强制使用强密码
   - 启用邮箱验证
   - 定期更新密码

3. **权限控制**
   - 严格控制管理员权限分配
   - 定期审查用户权限
   - 实施最小权限原则

## 支持

如果您在设置或使用过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查 Supabase 官方文档
3. 查看项目的 GitHub Issues
4. 联系开发团队

---

**注意**: 本认证系统已经完全集成到应用中，您只需要配置 Supabase 环境变量即可开始使用。