import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  taskService, 
  noteService, 
  pomodoroService, 
  chatService, 
  statsService 
} from '../services/database';

// 创建数据上下文
const DataContext = createContext();

// 初始状态
const initialState = {
  // 任务相关
  tasks: [],
  tasksLoading: false,
  tasksError: null,
  
  // 笔记相关
  notes: [],
  notesLoading: false,
  notesError: null,
  
  // 番茄钟相关
  pomodoroSessions: [],
  pomodoroLoading: false,
  pomodoroError: null,
  
  // 聊天相关
  chatMessages: [],
  chatLoading: false,
  chatError: null,
  
  // 统计数据
  stats: null,
  statsLoading: false,
  statsError: null
};

// 数据操作类型
const DATA_ACTIONS = {
  // 任务操作
  SET_TASKS_LOADING: 'SET_TASKS_LOADING',
  SET_TASKS: 'SET_TASKS',
  SET_TASKS_ERROR: 'SET_TASKS_ERROR',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  
  // 笔记操作
  SET_NOTES_LOADING: 'SET_NOTES_LOADING',
  SET_NOTES: 'SET_NOTES',
  SET_NOTES_ERROR: 'SET_NOTES_ERROR',
  ADD_NOTE: 'ADD_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  
  // 番茄钟操作
  SET_POMODORO_LOADING: 'SET_POMODORO_LOADING',
  SET_POMODORO_SESSIONS: 'SET_POMODORO_SESSIONS',
  SET_POMODORO_ERROR: 'SET_POMODORO_ERROR',
  ADD_POMODORO_SESSION: 'ADD_POMODORO_SESSION',
  UPDATE_POMODORO_SESSION: 'UPDATE_POMODORO_SESSION',
  
  // 聊天操作
  SET_CHAT_LOADING: 'SET_CHAT_LOADING',
  SET_CHAT_MESSAGES: 'SET_CHAT_MESSAGES',
  SET_CHAT_ERROR: 'SET_CHAT_ERROR',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  CLEAR_CHAT_MESSAGES: 'CLEAR_CHAT_MESSAGES',
  
  // 统计数据操作
  SET_STATS_LOADING: 'SET_STATS_LOADING',
  SET_STATS: 'SET_STATS',
  SET_STATS_ERROR: 'SET_STATS_ERROR',
  
  // 重置所有数据
  RESET_ALL_DATA: 'RESET_ALL_DATA'
};

// 数据reducer
function dataReducer(state, action) {
  switch (action.type) {
    // 任务操作
    case DATA_ACTIONS.SET_TASKS_LOADING:
      return { ...state, tasksLoading: action.payload, tasksError: null };
    case DATA_ACTIONS.SET_TASKS:
      return { ...state, tasks: action.payload, tasksLoading: false, tasksError: null };
    case DATA_ACTIONS.SET_TASKS_ERROR:
      return { ...state, tasksError: action.payload, tasksLoading: false };
    case DATA_ACTIONS.ADD_TASK:
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case DATA_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    case DATA_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    // 笔记操作
    case DATA_ACTIONS.SET_NOTES_LOADING:
      return { ...state, notesLoading: action.payload, notesError: null };
    case DATA_ACTIONS.SET_NOTES:
      return { ...state, notes: action.payload, notesLoading: false, notesError: null };
    case DATA_ACTIONS.SET_NOTES_ERROR:
      return { ...state, notesError: action.payload, notesLoading: false };
    case DATA_ACTIONS.ADD_NOTE:
      return { ...state, notes: [action.payload, ...state.notes] };
    case DATA_ACTIONS.UPDATE_NOTE:
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        )
      };
    case DATA_ACTIONS.DELETE_NOTE:
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload)
      };
    
    // 番茄钟操作
    case DATA_ACTIONS.SET_POMODORO_LOADING:
      return { ...state, pomodoroLoading: action.payload, pomodoroError: null };
    case DATA_ACTIONS.SET_POMODORO_SESSIONS:
      return { ...state, pomodoroSessions: action.payload, pomodoroLoading: false, pomodoroError: null };
    case DATA_ACTIONS.SET_POMODORO_ERROR:
      return { ...state, pomodoroError: action.payload, pomodoroLoading: false };
    case DATA_ACTIONS.ADD_POMODORO_SESSION:
      return { ...state, pomodoroSessions: [action.payload, ...state.pomodoroSessions] };
    case DATA_ACTIONS.UPDATE_POMODORO_SESSION:
      return {
        ...state,
        pomodoroSessions: state.pomodoroSessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        )
      };
    
    // 聊天操作
    case DATA_ACTIONS.SET_CHAT_LOADING:
      return { ...state, chatLoading: action.payload, chatError: null };
    case DATA_ACTIONS.SET_CHAT_MESSAGES:
      return { ...state, chatMessages: action.payload, chatLoading: false, chatError: null };
    case DATA_ACTIONS.SET_CHAT_ERROR:
      return { ...state, chatError: action.payload, chatLoading: false };
    case DATA_ACTIONS.ADD_CHAT_MESSAGE:
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case DATA_ACTIONS.CLEAR_CHAT_MESSAGES:
      return { ...state, chatMessages: [] };
    
    // 统计数据操作
    case DATA_ACTIONS.SET_STATS_LOADING:
      return { ...state, statsLoading: action.payload, statsError: null };
    case DATA_ACTIONS.SET_STATS:
      return { ...state, stats: action.payload, statsLoading: false, statsError: null };
    case DATA_ACTIONS.SET_STATS_ERROR:
      return { ...state, statsError: action.payload, statsLoading: false };
    
    // 重置所有数据
    case DATA_ACTIONS.RESET_ALL_DATA:
      return initialState;
    
    default:
      return state;
  }
}

// 数据提供者组件
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, tenant } = useAuth();

  // 当用户或租户改变时，重置数据
  useEffect(() => {
    if (!user || !tenant) {
      dispatch({ type: DATA_ACTIONS.RESET_ALL_DATA });
    }
  }, [user, tenant]);

  // 任务操作
  const taskActions = {
    async loadTasks() {
      dispatch({ type: DATA_ACTIONS.SET_TASKS_LOADING, payload: true });
      try {
        const tasks = await taskService.getAllTasks();
        dispatch({ type: DATA_ACTIONS.SET_TASKS, payload: tasks });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_TASKS_ERROR, payload: error.message });
      }
    },

    async createTask(taskData) {
      try {
        const newTask = await taskService.createTask(taskData);
        dispatch({ type: DATA_ACTIONS.ADD_TASK, payload: newTask });
        return newTask;
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_TASKS_ERROR, payload: error.message });
        throw error;
      }
    },

    async updateTask(taskId, updates) {
      try {
        const updatedTask = await taskService.updateTask(taskId, updates);
        dispatch({ type: DATA_ACTIONS.UPDATE_TASK, payload: updatedTask });
        return updatedTask;
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_TASKS_ERROR, payload: error.message });
        throw error;
      }
    },

    async deleteTask(taskId) {
      try {
        await taskService.deleteTask(taskId);
        dispatch({ type: DATA_ACTIONS.DELETE_TASK, payload: taskId });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_TASKS_ERROR, payload: error.message });
        throw error;
      }
    }
  };

  // 笔记操作
  const noteActions = {
    async loadNotes() {
      dispatch({ type: DATA_ACTIONS.SET_NOTES_LOADING, payload: true });
      try {
        const notes = await noteService.getAllNotes();
        dispatch({ type: DATA_ACTIONS.SET_NOTES, payload: notes });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_NOTES_ERROR, payload: error.message });
      }
    },

    async createNote(noteData) {
      try {
        const newNote = await noteService.createNote(noteData);
        dispatch({ type: DATA_ACTIONS.ADD_NOTE, payload: newNote });
        return newNote;
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_NOTES_ERROR, payload: error.message });
        throw error;
      }
    },

    async updateNote(noteId, updates) {
      try {
        const updatedNote = await noteService.updateNote(noteId, updates);
        dispatch({ type: DATA_ACTIONS.UPDATE_NOTE, payload: updatedNote });
        return updatedNote;
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_NOTES_ERROR, payload: error.message });
        throw error;
      }
    },

    async deleteNote(noteId) {
      try {
        await noteService.deleteNote(noteId);
        dispatch({ type: DATA_ACTIONS.DELETE_NOTE, payload: noteId });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_NOTES_ERROR, payload: error.message });
        throw error;
      }
    }
  };

  // 番茄钟操作
  const pomodoroActions = {
    async loadSessions() {
      dispatch({ type: DATA_ACTIONS.SET_POMODORO_LOADING, payload: true });
      try {
        const sessions = await pomodoroService.getSessions();
        dispatch({ type: DATA_ACTIONS.SET_POMODORO_SESSIONS, payload: sessions });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_POMODORO_ERROR, payload: error.message });
      }
    },

    async createSession(sessionData) {
      try {
        const newSession = await pomodoroService.createSession(sessionData);
        dispatch({ type: DATA_ACTIONS.ADD_POMODORO_SESSION, payload: newSession });
        return newSession;
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_POMODORO_ERROR, payload: error.message });
        throw error;
      }
    },

    async completeSession(sessionId) {
      try {
        const completedSession = await pomodoroService.completeSession(sessionId);
        dispatch({ type: DATA_ACTIONS.UPDATE_POMODORO_SESSION, payload: completedSession });
        return completedSession;
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_POMODORO_ERROR, payload: error.message });
        throw error;
      }
    }
  };

  // 聊天操作
  const chatActions = {
    async loadChatHistory() {
      dispatch({ type: DATA_ACTIONS.SET_CHAT_LOADING, payload: true });
      try {
        const messages = await chatService.getChatHistory();
        dispatch({ type: DATA_ACTIONS.SET_CHAT_MESSAGES, payload: messages });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_CHAT_ERROR, payload: error.message });
      }
    },

    async addMessage(role, content) {
      try {
        const newMessage = await chatService.addMessage(role, content);
        dispatch({ type: DATA_ACTIONS.ADD_CHAT_MESSAGE, payload: newMessage });
        return newMessage;
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_CHAT_ERROR, payload: error.message });
        throw error;
      }
    },

    async clearHistory() {
      try {
        await chatService.clearHistory();
        dispatch({ type: DATA_ACTIONS.CLEAR_CHAT_MESSAGES });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_CHAT_ERROR, payload: error.message });
        throw error;
      }
    }
  };

  // 统计数据操作
  const statsActions = {
    async loadStats() {
      dispatch({ type: DATA_ACTIONS.SET_STATS_LOADING, payload: true });
      try {
        const stats = await statsService.getDashboardStats();
        dispatch({ type: DATA_ACTIONS.SET_STATS, payload: stats });
      } catch (error) {
        dispatch({ type: DATA_ACTIONS.SET_STATS_ERROR, payload: error.message });
      }
    }
  };

  const value = {
    // 状态
    ...state,
    
    // 操作
    taskActions,
    noteActions,
    pomodoroActions,
    chatActions,
    statsActions
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// 自定义钩子
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}