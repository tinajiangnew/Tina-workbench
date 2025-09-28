import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, RotateCcwIcon, SettingsIcon, SaveIcon, BarChartIcon, CalendarIcon, ClockIcon, TargetIcon } from 'lucide-react';
import { RainbowCard, RainbowInput } from '../ui/rainbow-card';
import { RainbowButton } from '../ui/rainbow-button';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState('work'); // work, shortBreak, longBreak
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // 设置
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4
  });
  
  const [tempSettings, setTempSettings] = useState(settings);
  const intervalRef = useRef(null);
  
  // 统计和历史记录状态
  const [showStats, setShowStats] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalFocusTime: 0,
    averageSessionLength: 0
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // 从localStorage加载设置和历史记录
  useEffect(() => {
    const savedSettings = localStorage.getItem('personal-workspace-pomodoro-settings');
    const savedPomodoros = localStorage.getItem('personal-workspace-completed-pomodoros');
    const savedHistory = localStorage.getItem('personal-workspace-pomodoro-history');
    
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      setTempSettings(parsedSettings);
      // 初始化时间
      setTimeLeft(parsedSettings.workTime * 60);
    }
    
    if (savedPomodoros) {
      setCompletedPomodoros(parseInt(savedPomodoros));
    }
    
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setSessionHistory(parsedHistory);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 计算统计数据（在组件挂载后执行）
  useEffect(() => {
    calculateDailyStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // 时间结束处理
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
  }, [timeLeft, isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 会话完成处理
  const handleSessionComplete = () => {
    setIsRunning(false);
    playNotificationSound();
    showNotification();
    
    // 显示庆祝动画
    if (currentSession === 'work') {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    
    // 记录会话历史
    const sessionRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      sessionType: currentSession,
      duration: settings[currentSession === 'work' ? 'workTime' : currentSession === 'shortBreak' ? 'shortBreakTime' : 'longBreakTime'],
      completed: true
    };
    
    const updatedHistory = [sessionRecord, ...sessionHistory].slice(0, 100); // 保留最近100条记录
    setSessionHistory(updatedHistory);
    localStorage.setItem('personal-workspace-pomodoro-history', JSON.stringify(updatedHistory));
    
    // 更新统计数据
    calculateDailyStats();
    
    if (currentSession === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      localStorage.setItem('personal-workspace-completed-pomodoros', newCompletedPomodoros.toString());
      
      // 决定下一个会话类型
      if (newCompletedPomodoros % settings.longBreakInterval === 0) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakTime * 60);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakTime * 60);
      }
    } else {
      setCurrentSession('work');
      setTimeLeft(settings.workTime * 60);
    }
  };

  // 播放提示音
  const playNotificationSound = () => {
    // 创建简单的提示音
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  // 显示桌面通知
  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const sessionNames = {
        work: '工作时间',
        shortBreak: '短休息',
        longBreak: '长休息'
      };
      
      const nextSessionNames = {
        work: currentSession === 'work' ? (completedPomodoros + 1) % settings.longBreakInterval === 0 ? '长休息' : '短休息' : '工作时间',
        shortBreak: '工作时间',
        longBreak: '工作时间'
      };
      
      new Notification('番茄钟提醒', {
        body: `${sessionNames[currentSession]}结束！现在开始${nextSessionNames[currentSession]}。`,
        icon: '🍅'
      });
    }
  };

  // 开始/暂停
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // 重置
  const resetTimer = () => {
    setIsRunning(false);
    const sessionTimes = {
      work: settings.workTime * 60,
      shortBreak: settings.shortBreakTime * 60,
      longBreak: settings.longBreakTime * 60
    };
    setTimeLeft(sessionTimes[currentSession]);
  };

  // 切换会话类型
  const switchSession = (sessionType) => {
    setIsRunning(false);
    setCurrentSession(sessionType);
    const sessionTimes = {
      work: settings.workTime * 60,
      shortBreak: settings.shortBreakTime * 60,
      longBreak: settings.longBreakTime * 60
    };
    setTimeLeft(sessionTimes[sessionType]);
  };

  // 保存设置
  const saveSettings = () => {
    setSettings(tempSettings);
    localStorage.setItem('personal-workspace-pomodoro-settings', JSON.stringify(tempSettings));
    
    // 如果当前会话时间改变，更新计时器
    const sessionTimes = {
      work: tempSettings.workTime * 60,
      shortBreak: tempSettings.shortBreakTime * 60,
      longBreak: tempSettings.longBreakTime * 60
    };
    
    if (!isRunning) {
      setTimeLeft(sessionTimes[currentSession]);
    }
    
    setShowSettings(false);
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比
  const getProgress = () => {
    const sessionTimes = {
      work: settings.workTime * 60,
      shortBreak: settings.shortBreakTime * 60,
      longBreak: settings.longBreakTime * 60
    };
    const totalTime = sessionTimes[currentSession];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // 添加脉冲动画效果
  const getTimerAnimation = () => {
    if (!isRunning) return '';
    if (timeLeft <= 60 && currentSession === 'work') {
      return 'animate-pulse';
    }
    return '';
  };

  // 计算每日统计数据
  const calculateDailyStats = () => {
    const now = new Date();
    const today = now.toDateString();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;
    let totalFocusTime = 0;
    let workSessions = 0;
    
    sessionHistory.forEach(record => {
      const recordDate = new Date(record.date);
      const recordDateStr = recordDate.toDateString();
      
      if (record.sessionType === 'work') {
        totalFocusTime += record.duration;
        workSessions++;
        
        if (recordDateStr === today) {
          todayCount++;
        }
        if (recordDate >= thisWeekStart) {
          thisWeekCount++;
        }
        if (recordDate >= thisMonthStart) {
          thisMonthCount++;
        }
      }
    });
    
    setDailyStats({
      today: todayCount,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      totalFocusTime: Math.round(totalFocusTime * 10) / 10,
      averageSessionLength: workSessions > 0 ? Math.round((totalFocusTime / workSessions) * 10) / 10 : 0
    });
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('zh-CN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  // 清除历史记录
  const clearHistory = () => {
    if (window.confirm('确定要清除所有历史记录吗？此操作不可恢复。')) {
      setSessionHistory([]);
      localStorage.removeItem('personal-workspace-pomodoro-history');
      calculateDailyStats();
    }
  };

  // 导出数据
  const exportData = () => {
    const data = {
      history: sessionHistory,
      stats: dailyStats,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sessionNames = {
    work: '工作时间',
    shortBreak: '短休息',
    longBreak: '长休息'
  };

  return (
    <RainbowCard className="h-full flex flex-col items-center justify-center p-6">
      {/* 头部 */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🍅 番茄钟</h2>
          <div className="flex space-x-2">
            <RainbowButton
              onClick={() => setShowStats(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="统计"
            >
              <BarChartIcon size={20} />
            </RainbowButton>
            <RainbowButton
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="设置"
            >
              <SettingsIcon size={20} />
            </RainbowButton>
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">今日</div>
            <div className="text-2xl font-bold text-primary-600">{dailyStats.today}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">本周</div>
            <div className="text-2xl font-bold text-green-600">{dailyStats.thisWeek}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">本月</div>
            <div className="text-2xl font-bold text-blue-600">{dailyStats.thisMonth}</div>
          </div>
        </div>
      </div>

      {/* 主计时器 - 玻璃态设计 */}
      <div className="relative mb-8">
        {/* 圆形进度条 - 玻璃态效果 */}
        <div className="relative w-72 h-72">
          {/* 外层玻璃光环 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/30 shadow-2xl"></div>
          
          <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
            {/* 背景圆 - 玻璃态 */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
              fill="none"
              className="drop-shadow-sm"
            />
            {/* 进度圆 - 渐变色彩 */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={currentSession === 'work' ? 'url(#workGradient)' : currentSession === 'shortBreak' ? 'url(#breakGradient)' : 'url(#longBreakGradient)'}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000 ease-linear drop-shadow-lg"
            />
            {/* SVG渐变定义 */}
            <defs>
              <linearGradient id="workGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#ff8e8e" />
              </linearGradient>
              <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ecdc4" />
                <stop offset="100%" stopColor="#6bcf7f" />
              </linearGradient>
              <linearGradient id="longBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#45b7d1" />
                <stop offset="100%" stopColor="#6c5ce7" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* 内层玻璃态圆环 */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/40 shadow-inner"></div>
          
          {/* 时间显示 - 玻璃态效果 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className={`text-6xl font-bold mb-3 bg-gradient-to-br ${
              currentSession === 'work' ? 'from-red-400 to-red-600' : 
              currentSession === 'shortBreak' ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600'
            } bg-clip-text text-transparent drop-shadow-lg ${getTimerAnimation()}`}>
              {formatTime(timeLeft)}
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border ${
              currentSession === 'work' 
                ? 'bg-red-500/20 text-red-800 border-red-300/50 shadow-lg' 
                : currentSession === 'shortBreak' 
                ? 'bg-green-500/20 text-green-800 border-green-300/50 shadow-lg'
                : 'bg-blue-500/20 text-blue-800 border-blue-300/50 shadow-lg'
            }`}>
              {sessionNames[currentSession]}
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 mt-3 backdrop-blur-sm bg-white/30 px-3 py-1 rounded-full">
              <span className="font-medium">第 {completedPomodoros + 1} 个</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="font-medium">{completedPomodoros} 完成</span>
            </div>
          </div>
        </div>
      </div>

      {/* 控制按钮 - 玻璃态设计 */}
      <div className="flex justify-center space-x-6 mb-8">
        <RainbowButton
          onClick={toggleTimer}
          className={`flex items-center space-x-4 px-10 py-5 text-lg font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 backdrop-blur-sm border ${
            isRunning 
              ? 'bg-gradient-to-r from-yellow-400/80 to-orange-500/80 hover:from-yellow-500/90 hover:to-orange-600/90 text-white border-yellow-300/50 shadow-yellow-500/25' 
              : 'bg-gradient-to-r from-green-400/80 to-emerald-500/80 hover:from-green-500/90 hover:to-emerald-600/90 text-white border-green-300/50 shadow-green-500/25'
          }`}
        >
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            {isRunning ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
          </div>
          <span className="tracking-wide">{isRunning ? '暂停' : '开始'}</span>
        </RainbowButton>
        
        <RainbowButton
          onClick={resetTimer}
          className="flex items-center space-x-4 px-10 py-5 text-lg font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 bg-gradient-to-r from-slate-400/80 to-slate-600/80 hover:from-slate-500/90 hover:to-slate-700/90 text-white border-slate-300/50 shadow-slate-500/25 backdrop-blur-sm"
          title="重置"
        >
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <RotateCcwIcon size={28} />
          </div>
          <span className="tracking-wide">重置</span>
        </RainbowButton>
      </div>

      {/* 会话类型切换 */}
      {/* 会话类型选择 - 玻璃态设计 */}
      <div className="flex justify-center space-x-4 mb-8">
        <RainbowButton
          onClick={() => switchSession('work')}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border ${
            currentSession === 'work'
              ? 'bg-gradient-to-r from-red-500/90 to-rose-600/90 text-white shadow-2xl scale-105 border-red-300/50 shadow-red-500/30'
              : 'bg-white/20 hover:bg-white/30 text-gray-200 hover:text-white border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl'
          }`}
        >
          <span className="flex items-center space-x-3">
            <span className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentSession === 'work' ? 'bg-white shadow-lg shadow-white/50 scale-110' : 'bg-red-500 shadow-md'
            }`}></span>
            <span className="tracking-wide">工作</span>
          </span>
        </RainbowButton>
        <RainbowButton
          onClick={() => switchSession('shortBreak')}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border ${
            currentSession === 'shortBreak'
              ? 'bg-gradient-to-r from-green-500/90 to-emerald-600/90 text-white shadow-2xl scale-105 border-green-300/50 shadow-green-500/30'
              : 'bg-white/20 hover:bg-white/30 text-gray-200 hover:text-white border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl'
          }`}
        >
          <span className="flex items-center space-x-3">
            <span className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentSession === 'shortBreak' ? 'bg-white shadow-lg shadow-white/50 scale-110' : 'bg-green-500 shadow-md'
            }`}></span>
            <span className="tracking-wide">短休息</span>
          </span>
        </RainbowButton>
        <RainbowButton
          onClick={() => switchSession('longBreak')}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border ${
            currentSession === 'longBreak'
              ? 'bg-gradient-to-r from-blue-500/90 to-indigo-600/90 text-white shadow-2xl scale-105 border-blue-300/50 shadow-blue-500/30'
              : 'bg-white/20 hover:bg-white/30 text-gray-200 hover:text-white border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl'
          }`}
        >
          <span className="flex items-center space-x-3">
            <span className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentSession === 'longBreak' ? 'bg-white shadow-lg shadow-white/50 scale-110' : 'bg-blue-500 shadow-md'
            }`}></span>
            <span className="tracking-wide">长休息</span>
          </span>
        </RainbowButton>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RainbowCard className="!p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">番茄钟设置</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工作时间（分钟）
                </label>
                <RainbowInput
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.workTime}
                  onChange={(e) => setTempSettings({...tempSettings, workTime: parseInt(e.target.value) || 25})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  短休息时间（分钟）
                </label>
                <RainbowInput
                  type="number"
                  min="1"
                  max="30"
                  value={tempSettings.shortBreakTime}
                  onChange={(e) => setTempSettings({...tempSettings, shortBreakTime: parseInt(e.target.value) || 5})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  长休息时间（分钟）
                </label>
                <RainbowInput
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.longBreakTime}
                  onChange={(e) => setTempSettings({...tempSettings, longBreakTime: parseInt(e.target.value) || 15})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  长休息间隔（番茄钟数）
                </label>
                <RainbowInput
                  type="number"
                  min="2"
                  max="10"
                  value={tempSettings.longBreakInterval}
                  onChange={(e) => setTempSettings({...tempSettings, longBreakInterval: parseInt(e.target.value) || 4})}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <RainbowButton
                onClick={() => {
                  setShowSettings(false);
                  setTempSettings(settings);
                }}
                className="btn-secondary"
              >
                取消
              </RainbowButton>
              <RainbowButton
                onClick={saveSettings}
                className="btn-primary flex items-center space-x-2"
              >
                <SaveIcon size={16} />
                <span>保存</span>
              </RainbowButton>
            </div>
          </RainbowCard>
        </div>
      )}

      {/* 统计弹窗 */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RainbowCard className="!p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BarChartIcon className="mr-2" size={20} />
                番茄钟统计
              </h3>
              <div className="flex space-x-2">
                <RainbowButton
                  onClick={exportData}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="导出数据"
                >
                  <TargetIcon size={16} />
                </RainbowButton>
                <RainbowButton
                  onClick={clearHistory}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="清除历史"
                >
                  <RotateCcwIcon size={16} />
                </RainbowButton>
              </div>
            </div>
            
            {/* 统计概览 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <ClockIcon className="mx-auto mb-2 text-blue-600" size={24} />
                <div className="text-sm text-gray-600">总专注时间</div>
                <div className="text-xl font-bold text-blue-600">{dailyStats.totalFocusTime}h</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TargetIcon className="mx-auto mb-2 text-green-600" size={24} />
                <div className="text-sm text-gray-600">平均时长</div>
                <div className="text-xl font-bold text-green-600">{dailyStats.averageSessionLength}h</div>
              </div>
            </div>
            
            {/* 详细统计 */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">今日完成</span>
                <span className="font-semibold">{dailyStats.today} 个</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">本周完成</span>
                <span className="font-semibold">{dailyStats.thisWeek} 个</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">本月完成</span>
                <span className="font-semibold">{dailyStats.thisMonth} 个</span>
              </div>
            </div>
            
            {/* 最近记录 */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-3 flex items-center">
                <CalendarIcon className="mr-2" size={16} />
                最近记录
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sessionHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无记录</p>
                ) : (
                  sessionHistory.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          record.sessionType === 'work' ? 'bg-red-500' : 
                          record.sessionType === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></span>
                        <span>
                          {record.sessionType === 'work' ? '工作' : 
                           record.sessionType === 'shortBreak' ? '短休息' : '长休息'}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <span className="mr-2">{record.duration}分钟</span>
                        <span className="text-xs">{formatDate(record.date)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <RainbowButton
                onClick={() => setShowStats(false)}
                className="btn-secondary"
              >
                关闭
              </RainbowButton>
            </div>
          </RainbowCard>
        </div>
      )}

      {/* 庆祝动画 */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="text-6xl animate-bounce">
            🎉
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-bold text-green-600 animate-pulse">
              完成！
            </div>
          </div>
        </div>
      )}
    </RainbowCard>
  );
};

export default PomodoroTimer;