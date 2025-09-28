import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentTenant, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [configError, setConfigError] = useState(false)

  useEffect(() => {
    // 检查Supabase配置
    if (!isSupabaseConfigured()) {
      setConfigError(true)
      setLoading(false)
      return
    }

    // 设置加载超时
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout, setting loading to false')
      setLoading(false)
    }, 10000) // 10秒超时

    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          // 如果有用户，获取租户信息
          if (session?.user) {
            try {
              const tenantData = await getCurrentTenant()
              setTenant(tenantData)
            } catch (error) {
              console.error('Error getting tenant:', error)
              // 即使租户获取失败，也不阻止用户登录
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const tenantData = await getCurrentTenant()
            setTenant(tenantData)
          } catch (error) {
            console.error('Error getting tenant:', error)
            setTenant(null)
          }
        } else {
          setTenant(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 注册函数
  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      
      // 如果注册成功，创建租户
      if (data.user) {
        await createTenant(data.user)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 登录函数
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 登出函数
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // 创建租户
  const createTenant = async (user) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([
          {
            user_id: user.id,
            name: user.email.split('@')[0] + "'s Workspace",
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      setTenant(data)
      return data
    } catch (error) {
      console.error('Error creating tenant:', error)
      throw error
    }
  }

  // 重置密码
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // 更新密码
  const updatePassword = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    tenant,
    session,
    loading,
    configError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    createTenant
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}