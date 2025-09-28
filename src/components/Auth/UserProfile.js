import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const UserProfile = () => {
  const { user, tenant, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 text-sm bg-white rounded-full border border-gray-200 p-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <p className="font-medium text-gray-900">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500">
            {tenant?.name || '工作台'}
          </p>
        </div>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-gray-700">
              <p className="font-medium">工作空间</p>
              <p className="text-gray-500">{tenant?.name || '默认工作台'}</p>
            </div>
            
            <div className="px-3 py-2 text-sm text-gray-700">
              <p className="font-medium">用户ID</p>
              <p className="text-gray-500 font-mono text-xs">{user.id}</p>
            </div>
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile