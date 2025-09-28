import React, { useState, useEffect } from 'react';
import { format, parseISO, isBefore } from 'date-fns';
import { PlusIcon, FilterIcon } from 'lucide-react';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard, RainbowInput, RainbowTextarea, RainbowSelect } from '../ui/rainbow-card';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    estimatedHours: '',
    actualHours: ''
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // 从localStorage加载任务
  useEffect(() => {
    const savedTasks = localStorage.getItem('personal-workspace-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // 保存任务到localStorage
  const saveTasks = (updatedTasks) => {
    localStorage.setItem('personal-workspace-tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  // 添加新任务
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const now = new Date().toISOString();
    const task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };

    const updatedTasks = [...tasks, task];
    saveTasks(updatedTasks);
    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      estimatedHours: '',
      actualHours: ''
    });
  };

  // 更新任务
  const updateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === editingTaskId) {
        return {
          ...newTask,
          id: task.id,
          createdAt: task.createdAt,
          updatedAt: new Date().toISOString(),
          completedAt: newTask.status === 'completed' ? new Date().toISOString() : task.completedAt
        };
      }
      return task;
    });

    saveTasks(updatedTasks);
    setEditingTaskId(null);
    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      estimatedHours: '',
      actualHours: ''
    });
  };

  // 删除任务
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
  };

  // 开始编辑任务
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      assignee: task.assignee || '',
      estimatedHours: task.estimatedHours || '',
      actualHours: task.actualHours || ''
    });
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingTaskId(null);
    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      estimatedHours: '',
      actualHours: ''
    });
  };

  // 更改任务状态
  const changeTaskStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const updates = {
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        // 如果状态变为已完成，添加完成时间
        if (newStatus === 'completed') {
          updates.completedAt = new Date().toISOString();
        } else {
          // 如果从已完成变为其他状态，移除完成时间
          updates.completedAt = null;
        }
        
        return { ...task, ...updates };
      }
      return task;
    });
    
    saveTasks(updatedTasks);
  };

  // 获取过滤和排序后的任务
  const getFilteredAndSortedTasks = () => {
    // 先过滤
    let result = [...tasks];
    
    if (filter !== 'all') {
      result = result.filter(task => task.status === filter);
    }
    
    // 再排序
    result.sort((a, b) => {
      switch (sort) {
        case 'dueDate':
          // 没有截止日期的排在最后
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
    
    return result;
  };

  const filteredAndSortedTasks = getFilteredAndSortedTasks();

  // 计算统计信息
  const stats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      return isBefore(new Date(task.dueDate), new Date());
    }).length
  };

  return (
    <RainbowCard className="h-full flex flex-col p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 任务管理</h2>
          <p className="text-gray-600">管理项目任务、分配负责人、设置截止日期</p>
        </div>
        <div className="flex items-center space-x-3">
          <RainbowButton
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 !h-8 !px-3 ${
              showFilters ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <FilterIcon size={16} />
            <span>筛选</span>
          </RainbowButton>
          <RainbowButton
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 !h-8 !px-3"
          >
            <PlusIcon size={16} />
            <span>添加任务</span>
          </RainbowButton>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">总任务</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">待处理</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-blue-600">进行中</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-green-600">已完成</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-red-600">已逾期</div>
        </div>
      </div>

      {/* 添加/编辑任务表单 */}
      {(showAddForm || editingTaskId) && (
        <RainbowCard className="!p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingTaskId ? '编辑任务' : '添加新任务'}</h3>
          <form onSubmit={editingTaskId ? updateTask : addTask}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">任务标题</label>
                <RainbowInput
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="输入任务标题"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">负责人</label>
                <RainbowInput
                  type="text"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  placeholder="输入负责人"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                <RainbowSelect
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </RainbowSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                <RainbowSelect
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                  <option value="pending">待处理</option>
                  <option value="in-progress">进行中</option>
                  <option value="completed">已完成</option>
                </RainbowSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">截止日期</label>
                <RainbowInput
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <RainbowTextarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="输入任务描述"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <RainbowButton
                type="button"
                onClick={editingTaskId ? cancelEditing : () => setShowAddForm(false)}
                className="!h-8 !px-4"
              >
                取消
              </RainbowButton>
              <RainbowButton
                type="submit"
                className="!h-8 !px-4"
              >
                {editingTaskId ? '更新任务' : '添加任务'}
              </RainbowButton>
            </div>
          </form>
        </RainbowCard>
      )}

      {/* 筛选区域 */}
      {showFilters && (
        <RainbowCard className="!p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <RainbowSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="in-progress">进行中</option>
                <option value="completed">已完成</option>
              </RainbowSelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
              <RainbowSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">全部优先级</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </RainbowSelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">负责人</label>
              <RainbowInput
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="搜索负责人"
              />
            </div>
            <div className="flex items-end">
              <RainbowButton
                onClick={() => setFilter('all')}
                className="!h-10 !px-4 w-full"
              >
                清除筛选
              </RainbowButton>
            </div>
          </div>
        </RainbowCard>
      )}

      {/* 排序 */}
      <div className="flex justify-between mb-4">
        <div></div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">排序:</span>
          <RainbowSelect
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm"
          >
            <option value="dueDate">截止日期</option>
            <option value="priority">优先级</option>
            <option value="title">标题</option>
            <option value="createdAt">创建时间</option>
          </RainbowSelect>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无任务，请添加新任务
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedTasks.map(task => (
              <RainbowCard
                key={task.id}
                className={`!p-4 ${task.status === 'completed' ? 'opacity-75' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <RainbowButton
                    onClick={() => startEditing(task)}
                    className="!p-1 !h-6 !w-6 text-sm"
                    title="编辑"
                  >
                    ✏️
                  </RainbowButton>
                  <RainbowButton
                    onClick={() => deleteTask(task.id)}
                    className="!p-1 !h-6 !w-6 text-sm"
                    title="删除"
                  >
                    🗑️
                  </RainbowButton>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">状态: </span>
                    <select
                      value={task.status}
                      onChange={(e) => changeTaskStatus(task.id, e.target.value)}
                      className={`text-sm border-0 bg-transparent focus:ring-0 p-0 ${task.status === 'completed' ? 'text-green-600' : task.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                      <option value="pending">待处理</option>
                      <option value="in-progress">进行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">优先级: </span>
                    <span className={`${task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-orange-600' : 'text-green-600'}`}>
                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  
                  {task.assignee && (
                    <div>
                      <span className="text-gray-500">负责人: </span>
                      <span>{task.assignee}</span>
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <div>
                      <span className="text-gray-500">截止: </span>
                      <span className={`${task.status !== 'completed' && isBefore(new Date(task.dueDate), new Date()) ? 'text-red-600 font-medium' : ''}`}>
                        {format(parseISO(task.dueDate), 'yyyy-MM-dd')}
                      </span>
                    </div>
                  )}
                  
                  {(task.estimatedHours || task.actualHours) && (
                    <div>
                      <span className="text-gray-500">工时: </span>
                      <span>
                        {task.actualHours ? `${task.actualHours}h` : '0h'}
                        {task.estimatedHours ? ` / ${task.estimatedHours}h` : ''}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500">创建: </span>
                    <span>{format(parseISO(task.createdAt), 'MM-dd')}</span>
                  </div>
                </div>
              </RainbowCard>
            ))}
          </div>
        )}
      </div>
    </RainbowCard>
  );
};

export default TaskManager;