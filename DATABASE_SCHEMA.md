# 数据库架构设计

## 概述
本文档描述了Personal Workspace应用的数据库架构，基于Supabase PostgreSQL数据库，实现多租户数据隔离。

## 表结构

### 1. tenants（租户表）
```sql
CREATE TABLE tenants (
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
CREATE POLICY "Users can only access their own tenant" ON tenants
  FOR ALL USING (auth.uid() = user_id);
```

### 2. tasks（任务表）
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- 启用行级安全
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己租户的任务
CREATE POLICY "Users can only access their tenant tasks" ON tasks
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );
```

### 3. notes（笔记表）
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己租户的笔记
CREATE POLICY "Users can only access their tenant notes" ON notes
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );
```

### 4. pomodoro_sessions（番茄钟会话表）
```sql
CREATE TABLE pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  task_title TEXT,
  duration INTEGER DEFAULT 25, -- 分钟
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 启用行级安全
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己租户的番茄钟会话
CREATE POLICY "Users can only access their tenant pomodoro sessions" ON pomodoro_sessions
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );
```

### 5. chat_messages（聊天消息表）
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己租户的聊天消息
CREATE POLICY "Users can only access their tenant chat messages" ON chat_messages
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );
```

## 触发器

### 自动更新 updated_at 字段
```sql
-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建触发器
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 自动创建租户
```sql
-- 创建函数：用户注册时自动创建租户
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

-- 创建触发器：用户注册时自动创建租户
CREATE TRIGGER create_tenant_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_tenant_for_user();
```

## 索引优化
```sql
-- 为常用查询创建索引
CREATE INDEX idx_tenants_user_id ON tenants(user_id);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notes_tenant_id ON notes(tenant_id);
CREATE INDEX idx_pomodoro_sessions_tenant_id ON pomodoro_sessions(tenant_id);
CREATE INDEX idx_chat_messages_tenant_id ON chat_messages(tenant_id);
```

## 安全特性

1. **行级安全（RLS）**：所有表都启用了RLS，确保用户只能访问自己租户的数据
2. **外键约束**：确保数据完整性
3. **检查约束**：验证枚举值的有效性
4. **自动触发器**：自动创建租户和更新时间戳

## 使用说明

1. 在Supabase控制台中执行上述SQL语句
2. 确保启用了认证功能
3. 配置环境变量中的Supabase URL和密钥
4. 应用会自动处理用户注册和租户创建