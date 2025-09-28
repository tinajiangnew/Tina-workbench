import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon } from 'lucide-react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard } from '../ui/rainbow-card';
import { RainbowInput } from '../ui/rainbow-card';
import { useData } from '../../contexts/DataContext';

const TodoList = () => {
  const { 
    tasks, 
    tasksLoading, 
    tasksError, 
    taskActions 
  } = useData();
  
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // 加载任务数据
  useEffect(() => {
    taskActions.loadTasks();
  }, [taskActions]);

  // 添加新任务
  const addTodo = async () => {
    if (newTodo.trim() === '') return;
    
    try {
      await taskActions.createTask({
        title: newTodo.trim(),
        status: 'pending',
        priority: 'medium'
      });
      setNewTodo('');
    } catch (error) {
      console.error('添加任务失败:', error);
    }
  };

  // 切换完成状态
  const toggleTodo = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await taskActions.updateTask(id, { status: newStatus });
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  // 删除任务
  const deleteTodo = async (id) => {
    try {
      await taskActions.deleteTask(id);
    } catch (error) {
      console.error('删除任务失败:', error);
    }
  };

  // 开始编辑
  const startEdit = (id, title) => {
    setEditingId(id);
    setEditText(title);
  };

  // 保存编辑
  const saveEdit = async () => {
    if (editText.trim() === '') {
      cancelEdit();
      return;
    }
    
    try {
      await taskActions.updateTask(editingId, { title: editText.trim() });
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('更新任务失败:', error);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // 处理回车键
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // 过滤待办事项
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending' || task.status === 'in_progress';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });

  // 统计信息
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <RainbowCard className="h-full flex flex-col p-6">
      {/* 头部 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ 待办事项</h2>
        <p className="text-gray-600">管理您的日常任务和待办事项</p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <RainbowCard className="bg-blue-50 border-blue-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
          <div className="text-sm text-blue-600">总任务</div>
        </RainbowCard>
        <RainbowCard className="bg-orange-50 border-orange-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
          <div className="text-sm text-orange-600">待完成</div>
        </RainbowCard>
        <RainbowCard className="bg-green-50 border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          <div className="text-sm text-green-600">已完成</div>
        </RainbowCard>
      </div>

      {/* 添加新任务 */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <RainbowInput
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addTodo)}
            placeholder="添加新任务..."
            className="flex-1"
          />
          <RainbowButton
            onClick={addTodo}
            className="flex items-center space-x-2"
          >
            <PlusIcon size={16} />
            <span>添加</span>
          </RainbowButton>
        </div>
      </div>

      {/* 筛选按钮 */}
      <div className="flex space-x-2 mb-6">
        <RainbowButton
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'opacity-100' : 'opacity-70'}`}
        >
          全部 ({totalTasks})
        </RainbowButton>
        <RainbowButton
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'opacity-100' : 'opacity-70'}`}
        >
          待办 ({pendingTasks})
        </RainbowButton>
        <RainbowButton
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'completed' ? 'opacity-100' : 'opacity-70'}`}
        >
          已完成 ({completedTasks})
        </RainbowButton>
      </div>

      {/* 加载状态 */}
      {tasksLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载任务中...</p>
        </div>
      )}

      {/* 错误状态 */}
      {tasksError && (
        <div className="text-center py-12 text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg mb-2">加载任务失败</p>
          <p className="text-sm">{tasksError}</p>
        </div>
      )}

      {/* 任务列表 */}
      {!tasksLoading && !tasksError && (
        <div className="flex-1 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-lg mb-2">
                {filter === 'all' && '还没有任务'}
                {filter === 'pending' && '没有待办任务'}
                {filter === 'completed' && '没有已完成任务'}
              </p>
              <p className="text-sm">
                {filter === 'all' && '添加第一个任务开始管理您的待办事项'}
                {filter === 'pending' && '所有任务都已完成！'}
                {filter === 'completed' && '完成一些任务后会显示在这里'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <RainbowCard
                  key={task.id}
                  className={`group flex items-center space-x-3 p-4 transition-all hover:shadow-sm ${
                    task.status === 'completed' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {/* 复选框 */}
                  <RainbowButton
                    onClick={() => toggleTodo(task.id, task.status)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors p-0 ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {task.status === 'completed' && <CheckIcon size={12} />}
                  </RainbowButton>

                  {/* 任务内容 */}
                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="flex items-center space-x-2">
                        <RainbowInput
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                          className="flex-1 px-2 py-1 text-sm"
                          autoFocus
                        />
                        <RainbowButton
                          onClick={saveEdit}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <CheckIcon size={16} />
                        </RainbowButton>
                        <RainbowButton
                          onClick={cancelEdit}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <XIcon size={16} />
                        </RainbowButton>
                      </div>
                    ) : (
                      <div
                        onDoubleClick={() => startEdit(task.id, task.title)}
                        className="cursor-pointer"
                      >
                        <p
                          className={`text-sm ${
                            task.status === 'completed'
                              ? 'line-through text-gray-500'
                              : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(task.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  {editingId !== task.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <RainbowButton
                        onClick={() => startEdit(task.id, task.title)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="编辑"
                      >
                        <EditIcon size={14} />
                      </RainbowButton>
                      <RainbowButton
                        onClick={() => deleteTodo(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        <TrashIcon size={14} />
                      </RainbowButton>
                    </div>
                  )}
                </RainbowCard>
              ))}
            </div>
          )}
        </div>
      )}
    </RainbowCard>
  );
};

export default TodoList;