import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// 检查环境变量是否配置
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseAnonKey !== 'your_supabase_anon_key')
}

// 只有在配置正确时才创建客户端
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// 租户相关的辅助函数
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getCurrentTenant = async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) throw error
  return data
}

// 数据隔离查询辅助函数
export const createTenantQuery = (tableName) => {
  return {
    select: (columns = '*') => supabase.from(tableName).select(columns),
    insert: (data) => supabase.from(tableName).insert(data),
    update: (data) => supabase.from(tableName).update(data),
    delete: () => supabase.from(tableName).delete(),
    // 自动添加租户过滤
    withTenantFilter: async function(query) {
      const tenant = await getCurrentTenant()
      if (!tenant) throw new Error('No tenant found')
      return query.eq('tenant_id', tenant.id)
    }
  }
}