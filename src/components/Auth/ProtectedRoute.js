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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
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