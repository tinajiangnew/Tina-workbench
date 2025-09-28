-- 修复用户注册问题的最小化 SQL 脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 tenants 表（用户注册必需）
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(user_id)
);

-- 启用行级安全
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的租户
DROP POLICY IF EXISTS "Users can only access their own tenant" ON tenants;
CREATE POLICY "Users can only access their own tenant" ON tenants
  FOR ALL USING (auth.uid() = user_id);

-- 2. 创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. 为 tenants 表创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. 创建用户注册时自动创建租户的函数
CREATE OR REPLACE FUNCTION create_tenant_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tenants (user_id, name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 创建触发器：用户注册时自动创建租户
DROP TRIGGER IF EXISTS create_tenant_on_signup ON auth.users;
CREATE TRIGGER create_tenant_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_tenant_for_user();

-- 6. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);

-- 完成提示
SELECT 'User registration fix completed! You can now register users.' as message;