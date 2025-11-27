import {
  X,
  Globe,
  History,
  LogOut,
  Trash2,
  MessageSquarePlus,
  User as UserIcon,
} from "lucide-react";

import { useState } from "react";

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

const theme = {
  main: "#0B3C6C",
  accent: "#F5C629",
  background: "#F0F8FF",
  text: "#0B3C6C",
  subtext: "#4B5563",
  card: "#DCEAF8",
  elevated: "#C7D9EA",
};

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
  user,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"language" | "history">(
    "language"
  );

  const languages = [
    { code: "english", label: "English", flag: "🇬🇧" },
    { code: "tagalog", label: "Tagalog", flag: "🇵🇭" },
    { code: "bisaya", label: "Bisaya", flag: "🇵🇭" },
  ];

  const getPreviewText = (messages: any[]) => {
    if (!messages || messages.length === 0) return "New conversation";
    const firstUserMessage = messages.find((m) => m.role === "user");
    return firstUserMessage?.content.substring(0, 50) + "..." || "New conversation";
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
      {/* overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 z-50 transform transition-transform duration-300 shadow-xl`}
        style={{
          backgroundColor: theme.background,
          boxShadow: "4px 0px 12px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div
            className="flex items-center justify-between px-4 py-4"
            style={{ backgroundColor: theme.main }}
          >
            <h2 className="text-white font-bold text-lg">Settings</h2>

            <button className="p-2 rounded" onClick={onClose}>
              <X className="text-white w-5 h-5" />
            </button>
          </div>

          {/* USER SECTION */}
          {!isFreeMode && user && (
            <div
              className="flex items-center gap-3 px-4 py-4 border-b"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.elevated,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.main }}
              >
                <UserIcon className="text-white w-6 h-6" />
              </div>

              <div className="flex-1">
                <p
                  className="font-bold truncate"
                  style={{ color: theme.main }}
                >
                  {user.user_metadata?.name || "User"}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: theme.subtext }}
                >
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* TABS */}
          {!isFreeMode && (
            <div
              className="flex border-b"
              style={{ borderColor: theme.elevated }}
            >
              {["language", "history"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors"
                  style={{
                    color:
                      activeTab === tab ? theme.main : theme.subtext,
                    borderBottom:
                      activeTab === tab ? `3px solid ${theme.accent}` : "3px solid transparent",
                    fontWeight: activeTab === tab ? "bold" : "500",
                  }}
                >
                  {tab === "language" ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <History className="w-4 h-4" />
                  )}
                  <span className="text-sm capitalize">{tab}</span>
                </button>
              ))}
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto">
            {isFreeMode ? (
              <div className="p-6 text-center">
                <div
                  className="p-6 rounded-lg mb-4"
                  style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.elevated}`,
                  }}
                >
                  <h3
                    className="font-bold"
                    style={{ color: theme.main }}
                  >
                    Free Mode
                  </h3>
                  <p
                    className="text-sm mt-2"
                    style={{ color: theme.subtext }}
                  >
                    Sign in to unlock chat history and language preferences
                  </p>
                </div>
                <p className="text-xs" style={{ color: theme.subtext }}>
                  ⚠ Your conversations are not saved in free mode
                </p>
              </div>
            ) : activeTab === "language" ? (
              <div className="p-4">
                <p
                  className="text-sm mb-4"
                  style={{ color: theme.subtext }}
                >
                  Select your preferred language:
                </p>

                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                      style={{
                        backgroundColor:
                          language === lang.code
                            ? theme.accent
                            : theme.elevated,
                        color: theme.main,
                        fontWeight: "600",
                      }}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && (
                        <span className="ml-auto font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* New Chat */}
                <div
                  className="p-4 border-b"
                  style={{ borderColor: theme.elevated }}
                >
                  <button
                    onClick={() => {
                      onNewChat();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme.main,
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    New Chat
                  </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chats.length === 0 ? (
                    <div className="text-center py-8">
                      <History
                        className="w-12 h-12 mx-auto mb-2"
                        style={{ color: theme.elevated }}
                      />
                      <p style={{ color: theme.subtext }}>
                        No chat history yet
                      </p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          onLoadChat(chat);
                          onClose();
                        }}
                        className="relative p-3 rounded-lg cursor-pointer transition-all group"
                        style={{
                          backgroundColor:
                            currentChatId === chat.id
                              ? theme.accent
                              : theme.card,
                          border:
                            currentChatId === chat.id
                              ? `1px solid ${theme.elevated}`
                              : "none",
                        }}
                      >
                        <p
                          className="text-sm pr-8 line-clamp-2"
                          style={{ color: theme.main }}
                        >
                          {getPreviewText(chat.messages)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span
                            className="text-xs"
                            style={{ color: theme.subtext }}
                          >
                            {formatDate(chat.updatedAt)}
                          </span>
                          <span
                            className="text-xs uppercase"
                            style={{ color: theme.subtext }}
                          >
                            {chat.language}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded transition-all"
                          style={{
                            backgroundColor: "#FEE2E2",
                            color: "#B91C1C",
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          {!isFreeMode && (
            <div
              className="p-4 border-t"
              style={{ borderColor: theme.elevated }}
            >
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all"
                style={{
                  backgroundColor: "#FEE2E2",
                  color: "#B91C1C",
                  fontWeight: "bold",
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
