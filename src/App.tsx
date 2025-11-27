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

const theme = {
  main: "#0B3C6C",
  accent: "#F5C629",
  background: "#F0F8FF",
  text: "#0B3C6C",
  subtext: "#4B5563",
  card: "#DCEAF8",
  elevated: "#C7D9EA",
};

export default function App() {
  /* ---------------- AUTH STATE ---------------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isFreeMode, setIsFreeMode] = useState(false);

  const [showWelcome, setShowWelcome] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  /* ---------------- CHAT STATE ---------------- */
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [language, setLanguage] = useState('english');

  /* ---------------- UI STATE ---------------- */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
  useEffect(() => { checkSession(); }, []);
  useEffect(() => { if (isAuthenticated && !isFreeMode && accessToken) loadChatHistory(); }, [isAuthenticated, isFreeMode]);

  /* ---------------- SESSION ---------------- */
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
    } catch (err) {
      console.error("Session error", err);
    }
  };

  const loadChatHistory = async () => {
    if (!accessToken) return;

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/history`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  /* ---------------- AUTH ACTIONS ---------------- */
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
    setShowWelcome(true);
    setShowLogin(false);
    setMessages([]);
    setConversationHistory([]);
    setChats([]);
    setCurrentChatId('');
  };

  /* ---------------- CHAT MGMT ---------------- */
  const generateNewChatId = () => setCurrentChatId(`chat_${Date.now()}`);

  const handleNewChat = () => {
    setMessages([]);
    setConversationHistory([]);
    generateNewChatId();
  };

  const handleLoadChat = (chat: Chat) => {
    setCurrentChatId(chat.id);
    setLanguage(chat.language);
    setConversationHistory(chat.messages);

    setMessages(chat.messages.map((msg, i) => ({
      id: `${chat.id}_${i}`,
      text: msg.content,
      isUser: msg.role === 'user',
    })));
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!accessToken) return;

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/chat/${chatId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) handleNewChat();
      }
    } catch (err) {
      console.error("Delete chat error:", err);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
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
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory,
            language,
            userId: isAuthenticated && !isFreeMode ? user?.id : null,
            chatId: isAuthenticated && !isFreeMode ? currentChatId : null
          })
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server Error");
      }

      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(data.conversationHistory);

      if (isAuthenticated && !isFreeMode) loadChatHistory();

    } catch (err) {
      console.error(err);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong.",
        isUser: false
      }]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  /* ---------------- RENDER ---------------- */

  if (showWelcome) {
    return (
      <WelcomeScreen
        onLoginClick={() => { setAuthMode('signin'); setShowLogin(true); setShowWelcome(false); }}
        onSignUpClick={() => { setAuthMode('signup'); setShowLogin(true); setShowWelcome(false); }}
        onContinueAsGuest={handleContinueAsFree}
        onBack={() => { setShowWelcome(false); setShowLogin(true); }}
      />
    );
  }

  if (showLogin) {
    return (
      <LoginPage
        onLogin={handleLogin}
        initialIsSignUp={authMode === 'signup'}
        onBack={() => { setShowLogin(false); setShowWelcome(true); }}
      />
    );
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <div
      className="flex flex-col h-screen w-full"
      style={{ backgroundColor: theme.background }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        isFreeMode={isFreeMode}
        onLogout={handleLogout}
        onShowLogin={() => { setShowWelcome(false); setShowLogin(true); setIsSidebarOpen(false); }}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
        chats={chats}
        currentChatId={currentChatId}
        user={user}
      />

      {/* Header */}
      <div
        className="w-full px-4 py-4 shadow-md flex items-center gap-3"
        style={{ backgroundColor: theme.main }}
      >
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:opacity-80"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.accent }}
        >
          <Scale className="w-6 h-6" style={{ color: theme.main }} />
        </div>

        <div className="flex-1">
          <h1 className="font-semibold text-white">JusticeConnect</h1>
          <p className="text-xs opacity-80 text-white">
            {isFreeMode ? "Free Mode" : `Philippine Law AI • ${language}`}
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col h-full">
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">

              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.card }}
              >
                <Scale className="w-10 h-10" style={{ color: theme.main }} />
              </div>

              <h2 className="text-lg font-semibold" style={{ color: theme.text }}>
                Welcome to JusticeConnect
              </h2>

              <p className="text-sm mt-2" style={{ color: theme.subtext }}>
                Ask me anything about Philippine law
              </p>

              {isFreeMode && (
                <div
                  className="mt-4 px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: theme.elevated,
                    color: theme.text,
                    border: `1px solid ${theme.main}20`,
                  }}
                >
                  ⚠️ Free Mode: Chat history is disabled
                </div>
              )}
            </div>

            <div className="mt-auto">
              <QuickActions onActionClick={sendMessage} language={language} />
              <p
                className="text-xs text-center py-4"
                style={{ color: theme.subtext }}
              >
                ⚠️ For general information only, not legal advice
              </p>
            </div>
          </div>
        ) : (
          /* With chat messages */
          <div className="relative">
            <div className="px-4 py-4">
              {messages.map(m => (
                <ChatMessage key={m.id} message={m.text} isUser={m.isUser} />
              ))}

              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating new chat button */}
            <button
              onClick={handleNewChat}
              className="fixed top-20 right-4 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-30"
              style={{ backgroundColor: theme.accent }}
              title="New Chat"
            >
              <Plus className="w-5 h-5" style={{ color: theme.main }} />
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 shadow-md border-t"
        style={{ backgroundColor: theme.card, borderColor: theme.elevated }}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full focus:ring-2 outline-none"
            style={{
              border: `1px solid ${theme.elevated}`,
              backgroundColor: "white",
              color: theme.text
            }}
            placeholder="Ask about Philippine law..."
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor: theme.main,
              color: "white",
              opacity: !inputValue.trim() || isLoading ? 0.4 : 1
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
