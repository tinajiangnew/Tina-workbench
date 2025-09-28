/**
 * 权限验证工具
 * 用于验证和确保权限系统的安全性
 */

import { USER_ROLES } from '../lib/supabase';

// 指定管理员邮箱
const DESIGNATED_ADMIN_EMAIL = 'tinajiang51@gmail.com';

/**
 * 验证用户是否为指定的管理员
 * @param {Object} user - 用户对象
 * @returns {boolean} 是否为指定管理员
 */
export const isDesignatedAdmin = (user) => {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase();
};

/**
 * 验证用户权限的合法性
 * @param {Object} user - 用户对象
 * @param {string} userRole - 用户角色
 * @returns {Object} 验证结果
 */
export const validateUserPermissions = (user, userRole) => {
  const result = {
    isValid: true,
    shouldDowngrade: false,
    message: '',
    recommendedRole: userRole
  };

  // 如果用户是管理员角色
  if (userRole === USER_ROLES.ADMIN) {
    // 检查是否为指定的管理员邮箱
    if (!isDesignatedAdmin(user)) {
      result.isValid = false;
      result.shouldDowngrade = true;
      result.recommendedRole = USER_ROLES.USER;
      result.message = '只有指定邮箱可以拥有管理员权限';
    } else {
      result.message = '管理员权限验证通过';
    }
  } else {
    result.message = '普通用户权限正常';
  }

  return result;
};

/**
 * 检查注册数据的安全性
 * @param {Object} registrationData - 注册数据
 * @returns {Object} 检查结果
 */
export const validateRegistrationData = (registrationData) => {
  const result = {
    isValid: true,
    message: '',
    sanitizedData: { ...registrationData }
  };

  // 强制新用户角色为普通用户
  if (registrationData.role && registrationData.role !== USER_ROLES.USER) {
    result.sanitizedData.role = USER_ROLES.USER;
    result.message = '新用户只能注册为普通用户';
  }

  // 确保角色字段存在且正确
  if (!result.sanitizedData.role) {
    result.sanitizedData.role = USER_ROLES.USER;
  }

  return result;
};

/**
 * 生成权限系统状态报告
 * @param {Object} currentUser - 当前用户
 * @param {Array} allUsers - 所有用户列表（可选）
 * @returns {Object} 状态报告
 */
export const generatePermissionReport = (currentUser, allUsers = []) => {
  const report = {
    currentUser: {
      email: currentUser?.email || 'N/A',
      role: currentUser?.role || 'N/A',
      isDesignatedAdmin: isDesignatedAdmin(currentUser),
      permissionStatus: 'unknown'
    },
    systemStatus: {
      hasDesignatedAdmin: false,
      unauthorizedAdmins: [],
      totalUsers: allUsers.length,
      adminCount: 0,
      userCount: 0
    },
    recommendations: []
  };

  // 分析当前用户权限状态
  if (currentUser) {
    const validation = validateUserPermissions(currentUser, currentUser.role);
    report.currentUser.permissionStatus = validation.isValid ? 'valid' : 'invalid';
  }

  // 分析所有用户（如果提供）
  if (allUsers.length > 0) {
    allUsers.forEach(user => {
      if (user.role === USER_ROLES.ADMIN) {
        report.systemStatus.adminCount++;
        if (isDesignatedAdmin(user)) {
          report.systemStatus.hasDesignatedAdmin = true;
        } else {
          report.systemStatus.unauthorizedAdmins.push(user.email);
        }
      } else {
        report.systemStatus.userCount++;
      }
    });

    // 生成建议
    if (!report.systemStatus.hasDesignatedAdmin) {
      report.recommendations.push('建议为指定邮箱设置管理员权限');
    }

    if (report.systemStatus.unauthorizedAdmins.length > 0) {
      report.recommendations.push(`发现 ${report.systemStatus.unauthorizedAdmins.length} 个未授权的管理员账户，建议降级`);
    }

    if (report.systemStatus.adminCount === 0) {
      report.recommendations.push('系统中没有管理员，建议设置指定管理员');
    }
  }

  return report;
};

/**
 * 权限系统安全检查
 * @returns {Object} 安全检查结果
 */
export const performSecurityCheck = () => {
  const checks = {
    designatedAdminEmail: {
      status: DESIGNATED_ADMIN_EMAIL ? 'pass' : 'fail',
      message: DESIGNATED_ADMIN_EMAIL ? 
        `指定管理员邮箱: ${DESIGNATED_ADMIN_EMAIL}` : 
        '未设置指定管理员邮箱'
    },
    roleConstants: {
      status: (USER_ROLES.ADMIN && USER_ROLES.USER) ? 'pass' : 'fail',
      message: (USER_ROLES.ADMIN && USER_ROLES.USER) ? 
        '用户角色常量定义正确' : 
        '用户角色常量定义缺失'
    },
    validationFunctions: {
      status: 'pass',
      message: '权限验证函数已就绪'
    }
  };

  const overallStatus = Object.values(checks).every(check => check.status === 'pass') ? 'pass' : 'fail';

  return {
    overallStatus,
    checks,
    timestamp: new Date().toISOString()
  };
};