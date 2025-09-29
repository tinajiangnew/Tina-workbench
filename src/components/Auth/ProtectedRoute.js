import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthPage from './AuthPage'
import SupabaseConfigError from './SupabaseConfigError'

const ProtectedRoute = ({ children }) => {
  const { user, loading, configError } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 text-lg font-medium mb-1">快速加载中...</p>
          <p className="text-gray-500 text-sm">正在验证身份</p>
          <div className="mt-3 flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  if (configError) {
    return <SupabaseConfigError />
  }

  if (!user) {
    return <AuthPage />
  }

  return children
}

export default ProtectedRoute