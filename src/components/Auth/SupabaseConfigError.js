import React from 'react';

const SupabaseConfigError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Supabase 配置错误
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            应用无法连接到 Supabase 服务器。请检查您的配置。
          </p>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">解决步骤：</h4>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">1</span>
              <span>登录到 <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">Supabase Dashboard</a></span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">2</span>
              <span>选择您的项目或创建新项目</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">3</span>
              <span>在项目设置 → API 中复制 Project URL 和 anon public key</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">4</span>
              <span>更新 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件中的配置</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">5</span>
              <span>重启开发服务器</span>
            </li>
          </ol>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                注意
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>请确保不要将真实的 API 密钥提交到版本控制系统中。</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重新加载页面
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfigError;