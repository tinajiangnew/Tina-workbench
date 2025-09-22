import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PlusIcon, TrashIcon, EditIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { RainbowCard, RainbowInput, RainbowTextarea } from '../ui/rainbow-card';
import { RainbowButton } from '../ui/rainbow-button';

const Notepad = () => {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // 从localStorage加载笔记
  useEffect(() => {
    const savedNotes = localStorage.getItem('personal-workspace-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      if (parsedNotes.length > 0) {
        setActiveNoteId(parsedNotes[0].id);
      }
    }
  }, []);

  // 保存笔记到localStorage
  const saveNotes = (updatedNotes) => {
    localStorage.setItem('personal-workspace-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  // 创建新笔记
  const createNote = () => {
    const newNote = {
      id: uuidv4(),
      title: '无标题笔记',
      content: '# 新笔记\n\n开始编写您的内容...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  // 删除笔记
  const deleteNote = (noteId) => {
    if (window.confirm('确定要删除这条笔记吗？')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      saveNotes(updatedNotes);
      if (activeNoteId === noteId) {
        setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      }
    }
  };

  // 保存编辑
  const saveEdit = () => {
    const updatedNotes = notes.map(note => 
      note.id === activeNoteId 
        ? { ...note, title: editTitle, content: editContent, updatedAt: new Date().toISOString() }
        : note
    );
    saveNotes(updatedNotes);
    setIsEditing(false);
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditing(false);
    const activeNote = notes.find(note => note.id === activeNoteId);
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
    }
  };

  // 开始编辑
  const startEdit = () => {
    const activeNote = notes.find(note => note.id === activeNoteId);
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setIsEditing(true);
    }
  };

  const activeNote = notes.find(note => note.id === activeNoteId);

  return (
    <div className="h-full flex">
      {/* 笔记列表 */}
      <RainbowCard className="w-80 flex flex-col !rounded-none !border-r-0">
        {/* 列表头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">我的笔记</h3>
            <RainbowButton
            onClick={createNote}
            className="flex items-center space-x-2 text-sm"
          >
            <PlusIcon size={16} />
            <span>新建</span>
          </RainbowButton>
          </div>
        </div>
        
        {/* 笔记列表 */}
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>还没有笔记</p>
              <p className="text-sm mt-1">点击"新建"创建第一条笔记</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notes.map((note) => (
                <RainbowCard
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`!p-3 cursor-pointer transition-colors group ${
                    activeNoteId === note.id
                      ? 'ring-2 ring-primary-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {note.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {note.content.replace(/[#*`]/g, '').substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <RainbowButton
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <TrashIcon size={14} />
                    </RainbowButton>
                  </div>
                </RainbowCard>
              ))}
            </div>
          )}
        </div>
      </RainbowCard>
      
      {/* 笔记内容区域 */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            {/* 内容头部 */}
            <RainbowCard className="!p-4 !rounded-none !border-b-0 flex items-center justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <RainbowInput
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-semibold bg-transparent border-none outline-none w-full"
                    placeholder="笔记标题"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900">{activeNote.title}</h2>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  最后修改：{new Date(activeNote.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <RainbowButton onClick={saveEdit} className="text-sm">
                      保存
                    </RainbowButton>
                    <RainbowButton onClick={cancelEdit} className="text-sm">
                      取消
                    </RainbowButton>
                  </>
                ) : (
                  <RainbowButton onClick={startEdit} className="flex items-center space-x-2">
                    <EditIcon size={16} />
                    <span>编辑</span>
                  </RainbowButton>
                )}
              </div>
            </RainbowCard>
            
            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden">
              {isEditing ? (
                <div className="h-full flex">
                  {/* 编辑器 */}
                  <div className="flex-1 p-4">
                    <RainbowTextarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full resize-none font-mono text-sm"
                      placeholder="开始编写您的Markdown内容..."
                    />
                  </div>
                  {/* 预览 */}
                  <div className="flex-1 p-4 border-l border-gray-200 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {editContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full p-6 overflow-y-auto">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {activeNote.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">📝</p>
              <p>选择一条笔记开始阅读</p>
              <p className="text-sm mt-1">或创建新笔记开始记录</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notepad;