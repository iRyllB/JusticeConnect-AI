import { X, Globe, History, LogOut, Trash2, MessageSquarePlus, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Chat {
  id: string;
  userId: string;
  messages: any[];
  language: string;
  updatedAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  isFreeMode: boolean;
  onLogout: () => void;
  onLoadChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  chats: Chat[];
  currentChatId: string;
  user: any;
}

export function Sidebar({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  isFreeMode,
  onLogout,
  onLoadChat,
  onDeleteChat,
  onNewChat,
  chats,
  currentChatId,
  user
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'language' | 'history'>('language');

  const languages = [
    { code: 'english', label: 'English', flag: '🇬🇧' },
    { code: 'tagalog', label: 'Tagalog', flag: '🇵🇭' },
    { code: 'bisaya', label: 'Bisaya', flag: '🇵🇭' }
  ];

  const getPreviewText = (messages: any[]) => {
    if (!messages || messages.length === 0) return 'New conversation';
    const firstUserMessage = messages.find(m => m.role === 'user');
    return firstUserMessage?.content.substring(0, 50) + '...' || 'New conversation';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4">
            <div className="flex items-center justify-between">
              <h2>Settings</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          {!isFreeMode && user && (
            <div className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-200 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate">
                    {user.user_metadata?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          {!isFreeMode && (
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('language')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'language'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Language</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="text-sm">History</span>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isFreeMode ? (
              <div className="p-6 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                  <h3 className="text-gray-900 mb-2">Free Mode</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to unlock chat history and language preferences
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  ⚠️ Your conversations are not saved in free mode
                </p>
              </div>
            ) : activeTab === 'language' ? (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">Select your preferred language:</p>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        language === lang.code
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* New Chat Button */}
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => {
                      onNewChat();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span className="text-sm">New Chat</span>
                  </button>
                </div>

                {/* Chat History List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {chats.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No chat history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chats.filter(chat => chat && chat.id).map((chat) => (
                        <div
                          key={chat.id}
                          className={`group relative p-3 rounded-lg transition-colors cursor-pointer ${
                            currentChatId === chat.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            onLoadChat(chat);
                            onClose();
                          }}
                        >
                          <p className="text-sm text-gray-900 pr-8 line-clamp-2">
                            {getPreviewText(chat.messages)}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(chat.updatedAt)}
                            </span>
                            <span className="text-xs text-gray-400 uppercase">
                              {chat.language}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isFreeMode && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}