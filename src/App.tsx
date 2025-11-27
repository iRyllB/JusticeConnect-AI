import { useState, useRef, useEffect } from 'react';
import { Send, Scale, Menu, Plus } from 'lucide-react';
import { supabase } from './utils/supabase/client';
import { ChatMessage } from './components/ChatMessage';
import { TypingIndicator } from './components/TypingIndicator';
import { SuggestedQuestions } from './components/SuggestedQuestions';
import { LoginPage } from './components/LoginPage';
import WelcomeScreen from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import { QuickActions } from './components/QuickActions';
import { projectId, publicAnonKey } from './utils/supabase/info';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface Chat {
  id: string;
  userId: string;
  messages: any[];
  language: string;
  updatedAt: string;
}

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isFreeMode, setIsFreeMode] = useState(false);
  // UI flow: start at welcome screen, then go to login or main UI
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [language, setLanguage] = useState('english');

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Load chat history when authenticated
  useEffect(() => {
    if (isAuthenticated && !isFreeMode && accessToken) {
      loadChatHistory();
    }
  }, [isAuthenticated, isFreeMode]);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUser(session.user);
        setIsAuthenticated(true);
        setIsFreeMode(false);
        setShowWelcome(false);
        setShowLogin(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const loadChatHistory = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/history`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleLogin = (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setIsFreeMode(false);
    setShowLogin(false);
    setShowWelcome(false);
    generateNewChatId();
  };

  const handleContinueAsFree = () => {
    setIsFreeMode(true);
    setShowLogin(false);
    setShowWelcome(false);
    generateNewChatId();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsFreeMode(false);
    // After logout, show welcome screen first
    setShowLogin(false);
    setShowWelcome(true);
    setMessages([]);
    setConversationHistory([]);
    setChats([]);
    setCurrentChatId('');
  };

  const generateNewChatId = () => {
    setCurrentChatId(`chat_${Date.now()}`);
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationHistory([]);
    generateNewChatId();
  };

  const handleLoadChat = (chat: Chat) => {
    setCurrentChatId(chat.id);
    setLanguage(chat.language);
    setConversationHistory(chat.messages);
    
    // Convert history to display messages
    const displayMessages: Message[] = chat.messages.map((msg, idx) => ({
      id: `${chat.id}_${idx}`,
      text: msg.content,
      isUser: msg.role === 'user'
    }));
    
    setMessages(displayMessages);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/chat/${chatId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: conversationHistory,
            language: language,
            userId: isAuthenticated && !isFreeMode ? user?.id : null,
            chatId: isAuthenticated && !isFreeMode ? currentChatId : null
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from server:', errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(data.conversationHistory);

      // Reload chat history if authenticated
      if (isAuthenticated && !isFreeMode) {
        loadChatHistory();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleQuickAction = (question: string) => {
    sendMessage(question);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  if (showWelcome) {
    return (
      <WelcomeScreen
        onLoginClick={() => { setAuthMode('signin'); setShowLogin(true); setShowWelcome(false); }}
        onSignUpClick={() => { setAuthMode('signup'); setShowLogin(true); setShowWelcome(false); }}
        onContinueAsGuest={() => { handleContinueAsFree(); }}
      />
    );
  }

  if (showLogin) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onContinueAsFree={handleContinueAsFree}
        initialIsSignUp={authMode === 'signup'}
        onBack={() => { setShowLogin(false); setShowWelcome(true); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white w-full">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        isFreeMode={isFreeMode}
        onLogout={handleLogout}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
        chats={chats}
        currentChatId={currentChatId}
        user={user}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Scale className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold">JusticeConnect</h1>
            <p className="text-xs text-blue-100">
              {isFreeMode ? 'Free Mode' : `Philippine Law AI • ${language.charAt(0).toUpperCase() + language.slice(1)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Scale className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-gray-800 mb-2">
                {language === 'tagalog' ? 'Kumusta! Maligayang pagdating sa JusticeConnect' : 
                 language === 'bisaya' ? 'Kumusta! Malipayon nga pag-abot sa JusticeConnect' :
                 'Welcome to JusticeConnect'}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {language === 'tagalog' ? 'Tanungin mo ako tungkol sa batas ng Pilipinas' :
                 language === 'bisaya' ? 'Pangutana ko bahin sa balaod sa Pilipinas' :
                 'Ask me anything about Philippine law'}
              </p>
              {isFreeMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-800">
                  ⚠️ Free Mode: Chat history is disabled
                </div>
              )}
            </div>
            <div className="mt-auto">
              <QuickActions onActionClick={handleQuickAction} language={language} />
              <p className="text-xs text-gray-500 text-center px-4 pb-4">
                {language === 'tagalog' ? '⚠️ Para sa pangkalahatang impormasyon lamang, hindi legal advice' :
                 language === 'bisaya' ? '⚠️ Para sa general nga impormasyon lamang, dili legal advice' :
                 '⚠️ For general information only, not legal advice'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="px-4 py-4">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Floating New Chat Button */}
            <button
              onClick={handleNewChat}
              className="fixed top-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-30"
              title="Start New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              language === 'tagalog' ? 'Tanungin ang tungkol sa batas...' :
              language === 'bisaya' ? 'Pangutana bahin sa balaod...' :
              'Ask about Philippine law...'
            }
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}