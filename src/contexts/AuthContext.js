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

    let isMounted = true
    
    // 设置快速超时 - 减少到2秒
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth loading timeout, setting loading to false')
        setLoading(false)
      }
    }, 2000) // 2秒快速超时

    // 获取初始会话 - 优化版本
    const getInitialSession = async () => {
      try {
        // 更短的网络超时检查 - 1.5秒
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 1500)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
        
        if (!isMounted) return
        
        if (error) {
          console.error('Error getting session:', error)
          setSession(null)
          setUser(null)
          setTenant(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          // 异步获取租户信息，不阻塞登录流程
          if (session?.user) {
            // 立即设置loading为false，让用户先进入应用
            setLoading(false)
            clearTimeout(loadingTimeout)
            
            // 后台异步获取租户信息
            getCurrentTenant()
              .then(tenantData => {
                if (isMounted) {
                  setTenant(tenantData)
                }
              })
              .catch(error => {
                console.error('Error getting tenant:', error)
                if (isMounted) {
                  setTenant(null)
                }
              })
            return // 提前返回，避免重复设置loading
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setTenant(null)
        }
      }
      
      if (isMounted) {
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化 - 优化版本
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false) // 立即停止加载状态
        
        // 异步处理租户信息
        if (session?.user) {
          getCurrentTenant()
            .then(tenantData => {
              if (isMounted) {
                setTenant(tenantData)
              }
            })
            .catch(error => {
              console.error('Error getting tenant:', error)
              if (isMounted) {
                setTenant(null)
              }
            })
        } else {
          setTenant(null)
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
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
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // 清理本地状态
      setUser(null)
      setTenant(null)
      setSession(null)
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    } finally {
      setLoading(false)
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