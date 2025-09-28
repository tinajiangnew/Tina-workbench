import React from 'react'

const SupabaseConfigError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            配置错误
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Supabase 环境变量未正确配置
          </p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            需要配置以下环境变量：
          </h3>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-sm text-gray-800">
                REACT_APP_SUPABASE_URL
              </code>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-sm text-gray-800">
                REACT_APP_SUPABASE_ANON_KEY
              </code>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2">
              请在 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件中添加这些变量：
            </p>
            <div className="bg-gray-50 p-3 rounded-md font-mono text-xs">
              REACT_APP_SUPABASE_URL=your_supabase_url<br/>
              REACT_APP_SUPABASE_ANON_KEY=your_anon_key
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>提示：</strong> 您可以在 Supabase 项目设置中找到这些值。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupabaseConfigError