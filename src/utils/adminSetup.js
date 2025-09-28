import { supabase } from '../lib/supabase';

// 管理员邮箱配置 - 只有这个邮箱可以成为管理员
export const ADMIN_EMAIL = 'tinajiang51@gmail.com'; // 管理员邮箱

/**
 * 检查并设置管理员权限
 * 只有指定的邮箱才能成为管理员
 */
export const setupAdminUser = async () => {
  try {
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('用户未登录');
      return { success: false, message: '用户未登录' };
    }

    // 检查是否为指定的管理员邮箱
    if (user.email !== ADMIN_EMAIL) {
      console.log('非管理员邮箱，无法设置管理员权限');
      return { success: false, message: '您没有管理员权限' };
    }

    // 检查用户配置文件是否存在
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('查询用户配置文件失败:', profileError);
      return { success: false, message: '查询用户配置文件失败' };
    }

    // 如果配置文件不存在，创建管理员配置文件
    if (!profile) {
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.fullName || '系统管理员',
          email: user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('创建管理员配置文件失败:', insertError);
        return { success: false, message: '创建管理员配置文件失败' };
      }

      console.log('管理员配置文件创建成功');
      return { success: true, message: '管理员权限设置成功' };
    }

    // 如果配置文件存在但不是管理员，更新为管理员
    if (profile.role !== 'admin') {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('更新管理员权限失败:', updateError);
        return { success: false, message: '更新管理员权限失败' };
      }

      console.log('管理员权限更新成功');
      return { success: true, message: '管理员权限设置成功' };
    }

    console.log('用户已经是管理员');
    return { success: true, message: '您已经拥有管理员权限' };

  } catch (error) {
    console.error('设置管理员权限时发生错误:', error);
    return { success: false, message: '设置管理员权限时发生错误' };
  }
};

/**
 * 检查当前用户是否为指定的管理员
 */
export const isDesignatedAdmin = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    return user.email === ADMIN_EMAIL;
  } catch (error) {
    console.error('检查管理员身份失败:', error);
    return false;
  }
};

/**
 * 防止其他用户获得管理员权限的安全检查
 */
export const enforceAdminSecurity = async () => {
  try {
    // 查询所有管理员用户
    const { data: adminProfiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin');

    if (error) {
      console.error('查询管理员用户失败:', error);
      return;
    }

    // 检查是否有非指定邮箱的管理员
    const unauthorizedAdmins = adminProfiles.filter(profile => 
      profile.email !== ADMIN_EMAIL
    );

    // 如果发现未授权的管理员，将其降级为普通用户
    if (unauthorizedAdmins.length > 0) {
      console.warn('发现未授权的管理员，正在降级...');
      
      for (const admin of unauthorizedAdmins) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            role: 'user',
            updated_at: new Date().toISOString()
          })
          .eq('id', admin.id);

        if (updateError) {
          console.error(`降级用户 ${admin.email} 失败:`, updateError);
        } else {
          console.log(`用户 ${admin.email} 已被降级为普通用户`);
        }
      }
    }

  } catch (error) {
    console.error('执行管理员安全检查失败:', error);
  }
};

export default {
  setupAdminUser,
  isDesignatedAdmin,
  enforceAdminSecurity,
  ADMIN_EMAIL
};