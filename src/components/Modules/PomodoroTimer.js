import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, RotateCcwIcon, SettingsIcon, SaveIcon } from 'lucide-react';
import { RainbowCard, RainbowInput, RainbowSelect } from '../ui/rainbow-card';
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

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('personal-workspace-pomodoro-settings');
    const savedPomodoros = localStorage.getItem('personal-workspace-completed-pomodoros');
    
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      setTempSettings(parsedSettings);
    }
    
    if (savedPomodoros) {
      setCompletedPomodoros(parseInt(savedPomodoros));
    }
    
    // 初始化时间
    setTimeLeft(settings.workTime * 60);
  }, []);

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
  }, [timeLeft, isRunning]);

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 会话完成处理
  const handleSessionComplete = () => {
    setIsRunning(false);
    playNotificationSound();
    showNotification();
    
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

  const sessionNames = {
    work: '工作时间',
    shortBreak: '短休息',
    longBreak: '长休息'
  };

  const sessionColors = {
    work: 'text-red-600 bg-red-50 border-red-200',
    shortBreak: 'text-green-600 bg-green-50 border-green-200',
    longBreak: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      {/* 头部 */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🍅 番茄钟</h2>
          <RainbowButton
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="设置"
          >
            <SettingsIcon size={20} />
          </RainbowButton>
        </div>
        
        {/* 统计信息 */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600 mb-2">今日完成番茄钟</div>
          <div className="text-3xl font-bold text-primary-600">{completedPomodoros}</div>
        </div>
      </div>

      {/* 主计时器 */}
      <div className="relative mb-8">
        {/* 圆形进度条 */}
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* 背景圆 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* 进度圆 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={currentSession === 'work' ? '#ef4444' : currentSession === 'shortBreak' ? '#10b981' : '#3b82f6'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* 时间显示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${sessionColors[currentSession]}`}>
              {sessionNames[currentSession]}
            </div>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center space-x-4 mb-8">
        <RainbowButton
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors ${
            isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRunning ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </RainbowButton>
        
        <RainbowButton
          onClick={resetTimer}
          className="w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
          title="重置"
        >
          <RotateCcwIcon size={20} />
        </RainbowButton>
      </div>

      {/* 会话切换按钮 */}
      <div className="flex space-x-2">
        <RainbowButton
          onClick={() => switchSession('work')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentSession === 'work'
              ? 'bg-red-500 text-white ring-2 ring-red-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          工作
        </RainbowButton>
        <RainbowButton
          onClick={() => switchSession('shortBreak')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentSession === 'shortBreak'
              ? 'bg-green-500 text-white ring-2 ring-green-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          短休息
        </RainbowButton>
        <RainbowButton
          onClick={() => switchSession('longBreak')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentSession === 'longBreak'
              ? 'bg-blue-500 text-white ring-2 ring-blue-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          长休息
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
    </div>
  );
};

export default PomodoroTimer;