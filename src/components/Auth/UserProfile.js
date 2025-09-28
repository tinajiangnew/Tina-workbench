import React, { useState } from 'react';
import { RainbowCard } from '../ui/rainbow-card';
import { RainbowButton } from '../ui/rainbow-button';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = ({ onClose }) => {
  const { user, updateUserInfo, getUserRole } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateUserInfo(formData);
      setMessage('个人信息更新成功！');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const userRole = getUserRole();
  const roleDisplayName = userRole === 'admin' ? '管理员' : '普通用户';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <RainbowCard className="w-full max-w-md !p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">个人资料</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户角色
            </label>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                userRole === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                <span className="text-white font-bold text-sm">
                  {userRole === 'admin' ? '👑' : '👤'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{roleDisplayName}</span>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              姓名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="请输入您的姓名"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="邮箱地址不可修改"
            />
            <p className="text-xs text-gray-500 mt-1">邮箱地址不可修改</p>
          </div>

          <div className="flex space-x-4">
            <RainbowButton
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : '保存更改'}
            </RainbowButton>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
            >
              取消
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>账户创建时间: {new Date(user?.created_at).toLocaleDateString('zh-CN')}</p>
            <p>最后登录时间: {new Date(user?.last_sign_in_at).toLocaleDateString('zh-CN')}</p>
          </div>
        </div>
      </RainbowCard>
    </div>
  );
};

export default UserProfile;