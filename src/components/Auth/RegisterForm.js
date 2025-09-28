import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, UserPlusIcon, LogInIcon } from 'lucide-react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard, RainbowInput } from '../ui/rainbow-card';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../lib/supabase';
import { validateRegistrationData } from '../../utils/permissionValidator';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误和成功信息
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('请输入您的姓名');
      return false;
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱地址');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 验证注册数据安全性
      const validationResult = validateRegistrationData({
        ...formData,
        role: USER_ROLES.USER
      });

      if (!validationResult.isValid) {
        setError('注册数据验证失败');
        setIsLoading(false);
        return;
      }

      // 使用验证后的安全数据进行注册
      const { data, error } = await signUp(validationResult.sanitizedData.email, validationResult.sanitizedData.password, {
        fullName: validationResult.sanitizedData.fullName,
        role: validationResult.sanitizedData.role
      });
      
      if (error) {
        setError(getErrorMessage(error.message));
      } else if (data?.user) {
        setSuccess('注册成功！请检查您的邮箱并点击验证链接完成注册。');
        // 清空表单
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError('注册过程中发生错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorMessage) => {
    if (errorMessage.includes('User already registered')) {
      return '该邮箱已被注册，请使用其他邮箱或直接登录';
    }
    if (errorMessage.includes('Password should be at least 6 characters')) {
      return '密码长度至少为6位';
    }
    if (errorMessage.includes('Invalid email')) {
      return '请输入有效的邮箱地址';
    }
    return '注册失败，请检查您的信息';
  };

  return (
    <RainbowCard className="w-full max-w-md mx-auto !p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">创建账户</h2>
        <p className="text-gray-600">加入个人工作台</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            姓名
          </label>
          <RainbowInput
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="请输入您的姓名"
            required
            className="w-full"
            disabled={isLoading}
          />
        </div>

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
              placeholder="请输入密码（至少6位）"
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            确认密码
          </label>
          <div className="relative">
            <RainbowInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="请再次输入密码"
              required
              className="w-full pr-12"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
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
          <UserPlusIcon className="h-5 w-5" />
          <span>{isLoading ? '注册中...' : '注册'}</span>
        </RainbowButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">已有账户？</p>
        <button
          onClick={onSwitchToLogin}
          className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mx-auto"
          disabled={isLoading}
        >
          <LogInIcon className="h-5 w-5" />
          <span>立即登录</span>
        </button>
      </div>
    </RainbowCard>
  );
};

export default RegisterForm;