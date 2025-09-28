import { supabase, getCurrentUser, getCurrentTenant, createTenantQuery } from '../lib/supabase';

// 租户服务
export const tenantService = {
  // 获取当前用户的租户信息
  async getCurrentTenant() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('用户未登录');

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取租户信息失败:', error);
      throw error;
    }
  },

  // 更新租户设置
  async updateTenantSettings(settings) {
    try {
      const tenant = await getCurrentTenant();
      if (!tenant) throw new Error('租户不存在');

      const { data, error } = await supabase
        .from('tenants')
        .update({ settings, updated_at: new Date().toISOString() })
        .eq('id', tenant.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新租户设置失败:', error);
      throw error;
    }
  }
};

// 任务服务
export const taskService = {
  // 获取所有任务
  async getAllTasks() {
    try {
      const query = await createTenantQuery('tasks');
      const { data, error } = await query
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  },

  // 创建任务
  async createTask(taskData) {
    try {
      const tenant = await getCurrentTenant();
      if (!tenant) throw new Error('租户不存在');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          tenant_id: tenant.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  },

  // 更新任务
  async updateTask(taskId, updates) {
    try {
      const query = await createTenantQuery('tasks');
      const { data, error } = await query
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  },

  // 删除任务
  async deleteTask(taskId) {
    try {
      const query = await createTenantQuery('tasks');
      const { error } = await query
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  },

  // 根据状态获取任务
  async getTasksByStatus(status) {
    try {
      const query = await createTenantQuery('tasks');
      const { data, error } = await query
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取任务失败:', error);
      throw error;
    }
  }
};

// 笔记服务
export const noteService = {
  // 获取所有笔记
  async getAllNotes() {
    try {
      const query = await createTenantQuery('notes');
      const { data, error } = await query
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      throw error;
    }
  },

  // 创建笔记
  async createNote(noteData) {
    try {
      const tenant = await getCurrentTenant();
      if (!tenant) throw new Error('租户不存在');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          tenant_id: tenant.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  },

  // 更新笔记
  async updateNote(noteId, updates) {
    try {
      const query = await createTenantQuery('notes');
      const { data, error } = await query
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新笔记失败:', error);
      throw error;
    }
  },

  // 删除笔记
  async deleteNote(noteId) {
    try {
      const query = await createTenantQuery('notes');
      const { error } = await query
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw error;
    }
  }
};

// 番茄钟服务
export const pomodoroService = {
  // 获取番茄钟会话历史
  async getSessions(limit = 10) {
    try {
      const query = await createTenantQuery('pomodoro_sessions');
      const { data, error } = await query
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取番茄钟会话失败:', error);
      throw error;
    }
  },

  // 创建番茄钟会话
  async createSession(sessionData) {
    try {
      const tenant = await getCurrentTenant();
      if (!tenant) throw new Error('租户不存在');

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert({
          ...sessionData,
          tenant_id: tenant.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建番茄钟会话失败:', error);
      throw error;
    }
  },

  // 完成番茄钟会话
  async completeSession(sessionId) {
    try {
      const query = await createTenantQuery('pomodoro_sessions');
      const { data, error } = await query
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('完成番茄钟会话失败:', error);
      throw error;
    }
  }
};

// 聊天服务
export const chatService = {
  // 获取聊天历史
  async getChatHistory(limit = 50) {
    try {
      const query = await createTenantQuery('chat_messages');
      const { data, error } = await query
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      throw error;
    }
  },

  // 添加聊天消息
  async addMessage(role, content) {
    try {
      const tenant = await getCurrentTenant();
      if (!tenant) throw new Error('租户不存在');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          tenant_id: tenant.id,
          role,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('添加聊天消息失败:', error);
      throw error;
    }
  },

  // 清空聊天历史
  async clearHistory() {
    try {
      const query = await createTenantQuery('chat_messages');
      const { error } = await query.delete();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('清空聊天历史失败:', error);
      throw error;
    }
  }
};

// 统计服务
export const statsService = {
  // 获取仪表板统计数据
  async getDashboardStats() {
    try {
      const [tasks, notes, pomodoroSessions] = await Promise.all([
        taskService.getAllTasks(),
        noteService.getAllNotes(),
        pomodoroService.getSessions(100)
      ]);

      const taskStats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
      };

      const noteStats = {
        total: notes.length
      };

      const pomodoroStats = {
        total: pomodoroSessions.length,
        completed: pomodoroSessions.filter(s => s.completed).length,
        totalMinutes: pomodoroSessions
          .filter(s => s.completed)
          .reduce((sum, s) => sum + s.duration, 0)
      };

      return {
        tasks: taskStats,
        notes: noteStats,
        pomodoro: pomodoroStats
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw error;
    }
  }
};