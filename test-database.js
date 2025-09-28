// 数据库连接测试脚本
// 运行: node test-database.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 测试 Supabase 数据库连接...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少 Supabase 配置');
  console.log('请检查 .env.local 文件中的以下变量:');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✅ 环境变量配置正确');
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...`);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  try {
    console.log('\n🔄 测试数据库连接...');
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('tenants')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.tenants" does not exist')) {
        console.log('⚠️  tenants 表不存在');
        console.log('\n📋 需要执行以下步骤:');
        console.log('1. 打开 Supabase 控制台: https://supabase.com/dashboard');
        console.log('2. 选择您的项目');
        console.log('3. 进入 SQL Editor');
        console.log('4. 执行 database-init.sql 文件中的 SQL 语句');
        console.log('\n💡 或者复制以下 SQL 语句到 Supabase SQL Editor 中执行:');
        console.log('---');
        
        // 显示关键的表创建语句
        const createTenantTable = `
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id)
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tenant" ON tenants
  FOR ALL USING (auth.uid() = user_id);`;
        
        console.log(createTenantTable);
        console.log('---');
        
        return false;
      } else {
        throw error;
      }
    }

    console.log('✅ 数据库连接成功!');
    console.log(`📊 tenants 表存在，当前记录数: ${data?.length || 0}`);
    
    // 测试其他表
    const tables = ['tasks', 'notes', 'pomodoro_sessions', 'chat_messages'];
    console.log('\n🔍 检查其他表...');
    
    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
          
        if (tableError) {
          console.log(`❌ ${table} 表不存在`);
        } else {
          console.log(`✅ ${table} 表存在，记录数: ${tableData?.length || 0}`);
        }
      } catch (err) {
        console.log(`❌ ${table} 表检查失败: ${err.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 运行测试
testDatabaseConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 数据库测试完成!');
    } else {
      console.log('\n⚠️  需要先创建数据库表');
    }
  })
  .catch((error) => {
    console.error('\n💥 测试过程中发生错误:', error);
  });