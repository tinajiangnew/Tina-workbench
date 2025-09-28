import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LogInIcon, UserPlusIcon } from 'lucide-react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard, RainbowInput } from '../ui/rainbow-card';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError(getErrorMessage(error.message));
      } else if (data?.user) {
        // 登录成功，AuthContext会自动处理状态更新
        console.log('登录成功:', data.user);
      }
    } catch (err) {
      setError('登录过程中发生错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorMessage) => {
    if (errorMessage.includes('Invalid login credentials')) {
      return '邮箱或密码错误，请检查后重试';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return '请先验证您的邮箱地址';
    }
    if (errorMessage.includes('Too many requests')) {
      return '请求过于频繁，请稍后重试';
    }
    return '登录失败，请检查您的凭据';
  };

  return (
    <RainbowCard className="w-full max-w-md mx-auto !p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来</h2>
        <p className="text-gray-600">登录您的个人工作台</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            邮箱地址
          </label>
          <RainbowInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="请输入您的邮箱"
            required
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <div className="relative">
            <RainbowInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入您的密码"
              required
              className="w-full pr-12"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <RainbowButton
          type="submit"
          className="w-full flex items-center justify-center space-x-2"
          disabled={isLoading}
        >
          <LogInIcon className="h-5 w-5" />
          <span>{isLoading ? '登录中...' : '登录'}</span>
        </RainbowButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">还没有账户？</p>
        <button
          onClick={onSwitchToRegister}
          className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mx-auto"
          disabled={isLoading}
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>立即注册</span>
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            // TODO: 实现忘记密码功能
            alert('忘记密码功能即将推出');
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          忘记密码？
        </button>
      </div>
    </RainbowCard>
  );
};

export default LoginForm;