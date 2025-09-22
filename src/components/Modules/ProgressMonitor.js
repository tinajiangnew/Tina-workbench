import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfDay, subDays, isAfter, isBefore, isToday } from 'date-fns';
import { RainbowCard, RainbowInput, RainbowSelect } from '../ui/rainbow-card';
import { RainbowButton } from '../ui/rainbow-button';

const ProgressMonitor = () => {
  const [tasks, setTasks] = useState([]);
  const [timeframe, setTimeframe] = useState('all'); // all, week, month

  // 从localStorage加载任务
  useEffect(() => {
    const savedTasks = localStorage.getItem('personal-workspace-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // 获取过滤后的任务
  const getFilteredTasks = () => {
    if (timeframe === 'all') {
      return tasks;
    }
    
    const today = new Date();
    const startDate = timeframe === 'week' 
      ? subDays(today, 7) 
      : subDays(today, 30);
    
    return tasks.filter(task => {
      const taskDate = parseISO(task.createdAt);
      return isAfter(taskDate, startDate);
    });
  };

  const filteredTasks = getFilteredTasks();

  // 计算总体进度
  const calculateOverallProgress = () => {
    if (filteredTasks.length === 0) return 0;
    const completed = filteredTasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / filteredTasks.length) * 100);
  };

  // 获取逾期任务
  const getOverdueTasks = () => {
    const today = new Date();
    return filteredTasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const dueDate = parseISO(task.dueDate);
      return isBefore(dueDate, today);
    });
  };

  // 获取即将到期任务（3天内）
  const getUpcomingTasks = () => {
    const today = startOfDay(new Date());
    const threeDaysLater = subDays(today, -3); // 加3天
    
    return filteredTasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const dueDate = parseISO(task.dueDate);
      return isAfter(dueDate, today) && isBefore(dueDate, threeDaysLater);
    });
  };

  // 计算工时统计
  const calculateHoursStats = () => {
    const totalEstimated = filteredTasks.reduce((sum, task) => sum + (parseFloat(task.estimatedHours) || 0), 0);
    const totalActual = filteredTasks.reduce((sum, task) => sum + (parseFloat(task.actualHours) || 0), 0);
    const completedEstimated = filteredTasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (parseFloat(task.estimatedHours) || 0), 0);
    const completedActual = filteredTasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (parseFloat(task.actualHours) || 0), 0);
    
    return {
      totalEstimated,
      totalActual,
      completedEstimated,
      completedActual,
      variance: completedEstimated > 0 ? ((completedActual - completedEstimated) / completedEstimated) * 100 : 0
    };
  };

  // 按状态分组任务
  const getTasksByStatus = () => {
    const pending = filteredTasks.filter(task => task.status === 'pending').length;
    const inProgress = filteredTasks.filter(task => task.status === 'in-progress').length;
    const completed = filteredTasks.filter(task => task.status === 'completed').length;
    
    return { pending, inProgress, completed };
  };

  // 获取最近7天的任务趋势
  const getWeeklyTrend = () => {
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MM-dd');
      const isDateToday = isToday(date);
      
      // 当天创建的任务
      const created = filteredTasks.filter(task => {
        const taskDate = parseISO(task.createdAt);
        return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }).length;
      
      // 当天完成的任务
      const completed = filteredTasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = parseISO(task.completedAt);
        return format(completedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }).length;
      
      result.push({
        date: dateStr,
        created,
        completed,
        isToday: isDateToday
      });
    }
    
    return result;
  };

  const overallProgress = calculateOverallProgress();
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks();
  const hoursStats = calculateHoursStats();
  const tasksByStatus = getTasksByStatus();
  const weeklyTrend = getWeeklyTrend();

  return (
    <div className="h-full flex flex-col p-6">
      {/* 头部 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 进度监控</h2>
        <p className="text-gray-600">监控项目进度、统计数据和趋势分析</p>
      </div>

      {/* 时间范围筛选 */}
      <div className="flex space-x-2 mb-6">
        <RainbowButton
          onClick={() => setTimeframe('all')}
          className={`!px-3 !py-1 text-sm ${timeframe === 'all' ? 'ring-2 ring-blue-500' : ''}`}
        >
          全部时间
        </RainbowButton>
        <RainbowButton
          onClick={() => setTimeframe('month')}
          className={`!px-3 !py-1 text-sm ${timeframe === 'month' ? 'ring-2 ring-blue-500' : ''}`}
        >
          近30天
        </RainbowButton>
        <RainbowButton
          onClick={() => setTimeframe('week')}
          className={`!px-3 !py-1 text-sm ${timeframe === 'week' ? 'ring-2 ring-blue-500' : ''}`}
        >
          近7天
        </RainbowButton>
      </div>

      {/* 总体进度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RainbowCard className="!p-4">
          <h3 className="text-lg font-semibold mb-3">总体进度</h3>
          <div className="flex items-center mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
              <div 
                className="bg-primary-600 h-4 rounded-full" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold">{overallProgress}%</span>
          </div>
          <div className="grid grid-cols-3 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-600">{tasksByStatus.pending}</div>
              <div className="text-sm text-gray-600">待处理</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{tasksByStatus.inProgress}</div>
              <div className="text-sm text-blue-600">进行中</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{tasksByStatus.completed}</div>
              <div className="text-sm text-green-600">已完成</div>
            </div>
          </div>
        </RainbowCard>

        {/* 工时统计 */}
        <RainbowCard className="!p-4">
          <h3 className="text-lg font-semibold mb-3">工时统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">预估总工时</div>
              <div className="text-2xl font-bold text-gray-800">{Math.round(hoursStats.totalEstimated * 10) / 10}h</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">实际总工时</div>
              <div className="text-2xl font-bold text-gray-800">{Math.round(hoursStats.totalActual * 10) / 10}h</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">已完成任务预估</div>
              <div className="text-2xl font-bold text-gray-800">{Math.round(hoursStats.completedEstimated * 10) / 10}h</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">已完成任务实际</div>
              <div className="text-2xl font-bold text-gray-800">{Math.round(hoursStats.completedActual * 10) / 10}h</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-1">工时偏差</div>
            <div className={`text-xl font-bold ${hoursStats.variance > 0 ? 'text-red-600' : hoursStats.variance < 0 ? 'text-green-600' : 'text-gray-800'}`}>
              {hoursStats.variance > 0 ? '+' : ''}{Math.round(hoursStats.variance)}%
              <span className="text-sm font-normal ml-1">
                {hoursStats.variance > 0 ? '(超出预估)' : hoursStats.variance < 0 ? '(低于预估)' : '(符合预估)'}
              </span>
            </div>
          </div>
        </RainbowCard>
      </div>

      {/* 逾期和即将到期 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RainbowCard className="!p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="text-red-500 mr-2">⚠️</span> 逾期任务 ({overdueTasks.length})
          </h3>
          {overdueTasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>没有逾期任务</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {overdueTasks.map(task => (
                <RainbowCard key={task.id} className="!p-3">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600 mt-1 flex justify-between">
                    <div>
                      {task.assignee && <span className="mr-3">负责人: {task.assignee}</span>}
                      <span>截止: {format(parseISO(task.dueDate), 'yyyy-MM-dd')}</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                      {task.status === 'in-progress' ? '进行中' : '待处理'}
                    </div>
                  </div>
                </RainbowCard>
              ))}
            </div>
          )}
        </RainbowCard>

        <RainbowCard className="!p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="text-yellow-500 mr-2">⏰</span> 即将到期 ({upcomingTasks.length})
          </h3>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>没有即将到期的任务</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {upcomingTasks.map(task => (
                <RainbowCard key={task.id} className="!p-3">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600 mt-1 flex justify-between">
                    <div>
                      {task.assignee && <span className="mr-3">负责人: {task.assignee}</span>}
                      <span>截止: {format(parseISO(task.dueDate), 'yyyy-MM-dd')}</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                      {task.status === 'in-progress' ? '进行中' : '待处理'}
                    </div>
                  </div>
                </RainbowCard>
              ))}
            </div>
          )}
        </RainbowCard>
      </div>

      {/* 7日趋势 */}
      <RainbowCard className="!p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">7日任务趋势</h3>
        <div className="h-64">
          <div className="flex h-full">
            <div className="flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>10</span>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            <div className="flex-1 flex items-end">
              {weeklyTrend.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex justify-center space-x-1 mb-1">
                    <div 
                      className={`w-3 ${day.isToday ? 'bg-primary-500' : 'bg-blue-400'}`} 
                      style={{ height: `${day.created * 6}px` }}
                      title={`创建: ${day.created}`}
                    ></div>
                    <div 
                      className={`w-3 ${day.isToday ? 'bg-primary-700' : 'bg-green-500'}`} 
                      style={{ height: `${day.completed * 6}px` }}
                      title={`完成: ${day.completed}`}
                    ></div>
                  </div>
                  <div className={`text-xs ${day.isToday ? 'font-bold text-primary-600' : 'text-gray-500'}`}>
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-blue-400 mr-1"></div>
            <span className="text-xs text-gray-600">创建</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 mr-1"></div>
            <span className="text-xs text-gray-600">完成</span>
          </div>
        </div>
      </RainbowCard>

      {/* 占位：团队协作 */}
      <RainbowCard className="!p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <span className="text-purple-500 mr-2">👥</span> 团队协作
        </h3>
        <div className="text-center py-6 text-gray-500">
          <p className="mb-2">团队协作功能即将上线</p>
          <p className="text-sm">支持Slack/飞书集成、日报生成、任务分配等功能</p>
        </div>
      </RainbowCard>

      {/* 占位：资源管理 */}
      <RainbowCard className="!p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <span className="text-blue-500 mr-2">📊</span> 资源管理
        </h3>
        <div className="text-center py-6 text-gray-500">
          <p className="mb-2">资源管理功能即将上线</p>
          <p className="text-sm">支持按负责人、项目维度汇总工时和进度</p>
        </div>
      </RainbowCard>
    </div>
  );
};

export default ProgressMonitor;