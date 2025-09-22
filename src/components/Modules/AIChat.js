import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, SettingsIcon, PlusIcon, TrashIcon, SaveIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { RainbowButton } from '../ui/rainbow-button';
import { RainbowCard, RainbowInput, RainbowTextarea, RainbowSelect } from '../ui/rainbow-card';

const AIChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [provider, setProvider] = useState('openai'); // openai, moonshot, custom
  const [tempProvider, setTempProvider] = useState('openai');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [tempCustomEndpoint, setTempCustomEndpoint] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [tempModel, setTempModel] = useState('gpt-3.5-turbo');
  const messagesEndRef = useRef(null);

  // AI服务提供商配置
  const aiProviders = {
    openai: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' }
      ],
      keyPlaceholder: '请输入OpenAI API Key',
      keyUrl: 'https://platform.openai.com/api-keys'
    },
    moonshot: {
      name: 'Moonshot Kimi',
      endpoint: 'https://api.moonshot.cn/v1/chat/completions',
      models: [
        { value: 'moonshot-v1-8k', label: 'Moonshot v1 8K' },
        { value: 'moonshot-v1-32k', label: 'Moonshot v1 32K' },
        { value: 'moonshot-v1-128k', label: 'Moonshot v1 128K' }
      ],
      keyPlaceholder: '请输入Moonshot API Key',
      keyUrl: 'https://platform.moonshot.cn/console/api-keys'
    },
    custom: {
      name: '自定义服务',
      endpoint: '',
      models: [
        { value: 'custom-model', label: '自定义模型' }
      ],
      keyPlaceholder: '请输入API Key',
      keyUrl: ''
    }
  };

  // 从localStorage加载数据
  useEffect(() => {
    const savedConversations = localStorage.getItem('personal-workspace-conversations');
    const savedApiKey = localStorage.getItem('personal-workspace-api-key');
    const savedProvider = localStorage.getItem('personal-workspace-ai-provider');
    const savedCustomEndpoint = localStorage.getItem('personal-workspace-custom-endpoint');
    const savedModel = localStorage.getItem('personal-workspace-ai-model');
    
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      setConversations(parsedConversations);
      if (parsedConversations.length > 0) {
        setActiveConversationId(parsedConversations[0].id);
      }
    }
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTempApiKey(savedApiKey);
    }
    
    if (savedProvider) {
      setProvider(savedProvider);
      setTempProvider(savedProvider);
    }
    
    if (savedCustomEndpoint) {
      setCustomEndpoint(savedCustomEndpoint);
      setTempCustomEndpoint(savedCustomEndpoint);
    }
    
    if (savedModel) {
      setModel(savedModel);
      setTempModel(savedModel);
    } else {
      // 根据提供商设置默认模型
      const defaultModel = aiProviders[savedProvider || 'openai'].models[0].value;
      setModel(defaultModel);
      setTempModel(defaultModel);
    }
  }, []);

  // 当提供商改变时，更新默认模型
  useEffect(() => {
    if (tempProvider && aiProviders[tempProvider]) {
      const defaultModel = aiProviders[tempProvider].models[0].value;
      setTempModel(defaultModel);
    }
  }, [tempProvider]);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 保存对话到localStorage
  const saveConversations = (updatedConversations) => {
    localStorage.setItem('personal-workspace-conversations', JSON.stringify(updatedConversations));
    setConversations(updatedConversations);
  };

  // 保存API配置
  const saveApiSettings = () => {
    localStorage.setItem('personal-workspace-api-key', tempApiKey);
    localStorage.setItem('personal-workspace-ai-provider', tempProvider);
    localStorage.setItem('personal-workspace-custom-endpoint', tempCustomEndpoint);
    localStorage.setItem('personal-workspace-ai-model', tempModel);
    
    setApiKey(tempApiKey);
    setProvider(tempProvider);
    setCustomEndpoint(tempCustomEndpoint);
    setModel(tempModel);
    setShowSettings(false);
  };

  // 创建新对话
  const createNewConversation = () => {
    const newConversation = {
      id: uuidv4(),
      title: '新对话',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedConversations = [newConversation, ...conversations];
    saveConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
  };

  // 删除对话
  const deleteConversation = (conversationId) => {
    if (window.confirm('确定要删除这个对话吗？')) {
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      saveConversations(updatedConversations);
      
      if (activeConversationId === conversationId) {
        setActiveConversationId(updatedConversations.length > 0 ? updatedConversations[0].id : null);
      }
    }
  };

  // 清空当前对话
  const clearCurrentConversation = () => {
    if (window.confirm('确定要清空当前对话吗？')) {
      const updatedConversations = conversations.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [], updatedAt: new Date().toISOString() }
          : conv
      );
      saveConversations(updatedConversations);
    }
  };

  // 获取当前API端点
  const getCurrentEndpoint = () => {
    if (provider === 'custom') {
      return customEndpoint;
    }
    return aiProviders[provider].endpoint;
  };

  // 调用AI API
  const callAIAPI = async (messages) => {
    try {
      const endpoint = getCurrentEndpoint();
      if (!endpoint) {
        throw new Error('API端点未配置');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API调用失败: ${response.status} - ${errorData.error?.message || errorData.message || '未知错误'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI API调用错误:', error);
      throw error;
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    if (!apiKey) {
      alert('请先配置API Key');
      setShowSettings(true);
      return;
    }

    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // 添加用户消息
    const currentConversation = conversations.find(conv => conv.id === activeConversationId);
    const updatedMessages = [...(currentConversation?.messages || []), userMessage];
    
    const updatedConversations = conversations.map(conv =>
      conv.id === activeConversationId
        ? {
            ...conv,
            messages: updatedMessages,
            title: conv.messages.length === 0 ? message.trim().substring(0, 30) : conv.title,
            updatedAt: new Date().toISOString()
          }
        : conv
    );
    saveConversations(updatedConversations);
    
    setMessage('');
    setIsLoading(true);

    try {
      // 调用AI API
      const aiResponse = await callAIAPI(updatedMessages);
      
      const aiMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      // 添加AI响应
      const finalConversations = conversations.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...updatedMessages, aiMessage],
              updatedAt: new Date().toISOString()
            }
          : conv
      );
      saveConversations(finalConversations);
      
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 显示详细错误信息
      let errorMessage = '发送消息失败：';
      if (error.message.includes('401')) {
        errorMessage += 'API Key无效，请检查您的API Key是否正确。';
      } else if (error.message.includes('429')) {
        errorMessage += 'API调用频率超限，请稍后重试。';
      } else if (error.message.includes('insufficient_quota')) {
        errorMessage += 'API配额不足，请检查您的账户余额。';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      
      // 添加错误消息到对话中
      const errorMessage_obj = {
        id: uuidv4(),
        role: 'assistant',
        content: `❌ 错误：${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      
      const errorConversations = conversations.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...updatedMessages, errorMessage_obj],
              updatedAt: new Date().toISOString()
            }
          : conv
      );
      saveConversations(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  const currentProvider = aiProviders[provider] || aiProviders.openai;

  return (
    <div className="h-full flex">
      {/* 对话列表侧边栏 */}
      <RainbowCard className="w-80 flex flex-col !p-0">
        {/* 侧边栏头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI 对话</h3>
            <div className="flex items-center space-x-2">
              <RainbowButton
                onClick={() => setShowSettings(true)}
                className="p-2 !h-8 !px-2 text-sm"
                title="设置"
              >
                <SettingsIcon size={16} />
              </RainbowButton>
              <RainbowButton
                onClick={createNewConversation}
                className="flex items-center space-x-2 text-sm !h-8 !px-3"
              >
                <PlusIcon size={16} />
                <span>新对话</span>
              </RainbowButton>
            </div>
          </div>
          
          {/* 当前AI服务状态 */}
          <RainbowCard className="!p-3">
            <div className="text-xs text-gray-500 mb-1">当前AI服务</div>
            <div className="font-medium text-gray-900">{currentProvider.name}</div>
            <div className="text-xs text-gray-500">{model}</div>
          </RainbowCard>
        </div>
        
        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>还没有对话</p>
              <p className="text-sm mt-1">点击"新对话"开始聊天</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <RainbowCard
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`cursor-pointer transition-all duration-200 !p-3 group ${
                    activeConversationId === conversation.id
                      ? 'ring-2 ring-blue-500'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {conversation.messages.length} 条消息
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <RainbowButton
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 !p-1 !h-6 !w-6 text-sm"
                      title="删除对话"
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
      
      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* 聊天头部 */}
            <RainbowCard className="!p-4 !rounded-none !border-0 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{activeConversation.title}</h2>
                <p className="text-sm text-gray-500">
                  {activeConversation.messages.length} 条消息 | {currentProvider.name} - {model}
                </p>
              </div>
              <RainbowButton
                onClick={clearCurrentConversation}
                className="text-sm !h-8 !px-3"
              >
                清空对话
              </RainbowButton>
            </RainbowCard>
            
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-lg mb-2">开始新的对话</p>
                  <p className="text-sm">向AI助手提问任何问题</p>
                  <p className="text-xs mt-2 text-gray-400">当前使用: {currentProvider.name}</p>
                </div>
              ) : (
                activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <RainbowCard
                      className={`max-w-[70%] !p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div
                        className={`text-xs mt-2 ${
                          msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </RainbowCard>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <RainbowCard className="!p-3 bg-gray-100 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-gray-600">{currentProvider.name} 正在思考...</span>
                    </div>
                  </RainbowCard>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* 输入区域 */}
            <RainbowCard className="!p-4 !rounded-none !border-0 border-t border-gray-200">
              <div className="flex items-end space-x-3">
                <RainbowTextarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题..."
                  rows={3}
                  disabled={isLoading}
                  className="flex-1"
                />
                <RainbowButton
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SendIcon size={16} />
                  <span>发送</span>
                </RainbowButton>
              </div>
            </RainbowCard>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">🤖</p>
              <p>选择一个对话开始聊天</p>
              <p className="text-sm mt-1">或创建新对话</p>
              <p className="text-xs mt-2 text-gray-400">当前使用: {currentProvider.name}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RainbowCard className="!p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI设置</h3>
            
            <div className="space-y-4">
              {/* AI服务提供商选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI服务提供商
                </label>
                <RainbowSelect
                  value={tempProvider}
                  onChange={(e) => setTempProvider(e.target.value)}
                >
                  <option value="openai">OpenAI</option>
                  <option value="moonshot">Moonshot Kimi</option>
                  <option value="custom">自定义服务</option>
                </RainbowSelect>
              </div>
              
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key *
                </label>
                <RainbowInput
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={aiProviders[tempProvider]?.keyPlaceholder || '请输入API Key'}
                />
                {aiProviders[tempProvider]?.keyUrl && (
                  <p className="text-xs text-gray-500 mt-1">
                    获取API Key: <a href={aiProviders[tempProvider].keyUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{aiProviders[tempProvider].name}官网</a>
                  </p>
                )}
              </div>
              
              {/* 自定义端点 */}
              {tempProvider === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API端点 *
                  </label>
                  <RainbowInput
                    type="text"
                    value={tempCustomEndpoint}
                    onChange={(e) => setTempCustomEndpoint(e.target.value)}
                    placeholder="https://api.example.com/v1/chat/completions"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    请输入兼容OpenAI API格式的端点地址
                  </p>
                </div>
              )}
              
              {/* 模型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模型
                </label>
                <RainbowSelect
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                >
                  {aiProviders[tempProvider]?.models.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </RainbowSelect>
              </div>
              
              {/* 服务说明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">服务说明</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  {tempProvider === 'openai' && (
                    <>
                      <p>• OpenAI GPT系列模型，功能强大</p>
                      <p>• 需要国外网络环境</p>
                      <p>• 按使用量计费</p>
                    </>
                  )}
                  {tempProvider === 'moonshot' && (
                    <>
                      <p>• 国产AI模型，响应速度快</p>
                      <p>• 支持长文本处理（最高128K）</p>
                      <p>• 国内网络环境友好</p>
                    </>
                  )}
                  {tempProvider === 'custom' && (
                    <>
                      <p>• 支持任何兼容OpenAI API的服务</p>
                      <p>• 需要手动配置端点地址</p>
                      <p>• 适合企业内部部署</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* 安全提示 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ 安全提示：API Key将存储在浏览器本地。在生产环境中，建议通过后端代理API调用以保护密钥安全。
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <RainbowButton
                onClick={() => {
                  setShowSettings(false);
                  setTempApiKey(apiKey);
                  setTempProvider(provider);
                  setTempCustomEndpoint(customEndpoint);
                  setTempModel(model);
                }}
                className="!h-8 !px-4"
              >
                取消
              </RainbowButton>
              <RainbowButton
                onClick={saveApiSettings}
                disabled={!tempApiKey.trim() || (tempProvider === 'custom' && !tempCustomEndpoint.trim())}
                className="flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AIChat;