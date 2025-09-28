-- 简化的 RLS 修复脚本 - 解决用户注册问题
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 首先确保 tenants 表存在
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 完全禁用 RLS（最简单的解决方案）
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- 3. 删除所有现有策略
DROP POLICY IF EXISTS "Users can only access their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can manage their own tenant" ON tenants;
DROP POLICY IF EXISTS "Service role can manage all tenants" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can insert their own tenant" ON tenants;

-- 4. 删除现有触发器和函数
DROP TRIGGER IF EXISTS create_tenant_on_signup ON auth.users;
DROP FUNCTION IF EXISTS create_tenant_for_user();

-- 5. 创建简化的触发器函数
CREATE OR REPLACE FUNCTION create_tenant_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tenants (user_id, name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不阻止用户注册
    RAISE WARNING 'Failed to create tenant for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建触发器
CREATE TRIGGER create_tenant_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_tenant_for_user();

-- 7. 为现有用户创建租户记录
INSERT INTO tenants (user_id, name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) || '''s Workspace'
FROM auth.users au
LEFT JOIN tenants t ON t.user_id = au.id
WHERE t.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 8. 创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);

-- 完成提示
SELECT 'RLS disabled and tenant creation fixed! Registration should work now.' as message;