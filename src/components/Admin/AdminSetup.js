import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, UserCheckIcon, AlertTriangleIcon } from 'lucide-react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard } from '../ui/rainbow-card';
import { setupAdminUser, isDesignatedAdmin, ADMIN_EMAIL } from '../../utils/adminSetup';
import { useAuth } from '../../contexts/AuthContext';
import { 
  performSecurityCheck, 
  generatePermissionReport,
  validateUserPermissions 
} from '../../utils/permissionValidator';

const AdminSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [canSetupAdmin, setCanSetupAdmin] = useState(false);
  const { user, getUserRole } = useAuth();
  const [securityReport, setSecurityReport] = useState(null);
  const [permissionReport, setPermissionReport] = useState(null);

  useEffect(() => {
    const checkAdminEligibility = async () => {
      if (user) {
        const isEligible = await isDesignatedAdmin();
        setCanSetupAdmin(isEligible);
        
        if (!isEligible) {
          setMessage(`只有邮箱 ${ADMIN_EMAIL} 可以设置管理员权限`);
          setMessageType('info');
        }

        // 生成安全检查报告
        const securityCheck = performSecurityCheck();
        setSecurityReport(securityCheck);

        // 生成权限报告
        const permissionCheck = generatePermissionReport(user);
        setPermissionReport(permissionCheck);
      }
    };

    checkAdminEligibility();
  }, [user]);

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await setupAdminUser();
      
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        
        // 刷新页面以更新用户角色
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('设置管理员权限时发生错误');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const currentRole = getUserRole();
  const isCurrentlyAdmin = currentRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <RainbowCard className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">管理员设置</h1>
          <p className="text-gray-600">配置系统管理员权限</p>
        </div>

        {/* 当前状态显示 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <UserCheckIcon className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">当前用户</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isCurrentlyAdmin ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-700">当前角色</p>
              <p className="text-sm text-gray-600">
                {isCurrentlyAdmin ? '👑 管理员' : '👤 普通用户'}
              </p>
            </div>
          </div>
        </div>

        {/* 管理员邮箱信息 */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">安全提示</p>
              <p className="text-sm text-yellow-700 mt-1">
                只有邮箱 <code className="bg-yellow-100 px-1 rounded">{ADMIN_EMAIL}</code> 可以获得管理员权限
              </p>
            </div>
          </div>
        </div>

        {/* 消息显示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm ${
              messageType === 'success' ? 'text-green-700' :
              messageType === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-4">
          {canSetupAdmin && !isCurrentlyAdmin && (
            <RainbowButton
              onClick={handleSetupAdmin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              <span>{isLoading ? '设置中...' : '设置管理员权限'}</span>
            </RainbowButton>
          )}

          {isCurrentlyAdmin && (
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-700 font-medium">✅ 您已拥有管理员权限</p>
              <p className="text-purple-600 text-sm mt-1">可以访问管理员面板管理用户</p>
            </div>
          )}

          {!canSetupAdmin && (
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700 font-medium">❌ 无法设置管理员权限</p>
              <p className="text-gray-600 text-sm mt-1">您的邮箱不在管理员白名单中</p>
            </div>
          )}
        </div>

        {/* 安全检查报告 */}
        {securityReport && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              系统安全检查
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                securityReport.overallStatus === 'pass' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {securityReport.overallStatus === 'pass' ? '✅ 通过' : '❌ 失败'}
              </span>
            </h3>
            <div className="space-y-2">
              {Object.entries(securityReport.checks).map(([key, check]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{check.message}</span>
                  <span className={`px-2 py-1 rounded ${
                    check.status === 'pass' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {check.status === 'pass' ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 权限报告 */}
        {permissionReport && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">权限状态报告</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">权限状态:</span>
                <span className={`px-2 py-1 rounded ${
                  permissionReport.currentUser.permissionStatus === 'valid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {permissionReport.currentUser.permissionStatus === 'valid' ? '有效' : '待验证'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">指定管理员:</span>
                <span className={`px-2 py-1 rounded ${
                  permissionReport.currentUser.isDesignatedAdmin
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {permissionReport.currentUser.isDesignatedAdmin ? '是' : '否'}
                </span>
              </div>
              {permissionReport.recommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-gray-600 mb-1">建议:</p>
                  {permissionReport.recommendations.map((rec, index) => (
                    <p key={index} className="text-blue-700">• {rec}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 说明文档 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 只有指定邮箱可以成为管理员</li>
            <li>• 管理员可以管理所有用户账户</li>
            <li>• 系统会自动防止未授权的管理员权限</li>
            <li>• 新注册用户默认为普通用户</li>
          </ul>
        </div>
      </RainbowCard>
    </div>
  );
};

export default AdminSetup;