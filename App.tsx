import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SidePanel } from './components/SidePanel';
import {
  ChatMessage as ChatMessageType,
  Conversation,
  Language,
  MediaAttachment,
  ServerStatus,
  GeminiModelId,
} from './types';
import {
  getAllSessions,
  saveSessionToDb,
  deleteSessionFromDb,
  clearAllLocalData,
  getStoredLanguage,
  saveStoredLanguage,
  getStoredModel,
  saveStoredModel,
} from './utils/db';

export default function App() {
  const [language, setLanguage] = useState<Language>('fa');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3.8-flash');
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'checking',
    hasKey: true,
    latencyMs: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const imageTriggerRef = useRef<(() => void) | null>(null);
  const voiceTriggerRef = useRef<(() => void) | null>(null);

  // Synchronize document dir and lang with language state
  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Initial data loading from IndexedDB and server ping
  useEffect(() => {
    const initApp = async () => {
      // 1. Language & Model
      const storedLang = await getStoredLanguage();
      setLanguage(storedLang);

      const storedModel = await getStoredModel();
      setSelectedModel(storedModel);

      // 2. Offline Conversations from IndexedDB
      const storedSessions = await getAllSessions();
      setSessions(storedSessions);

      if (storedSessions.length > 0) {
        // Load the latest conversation
        setActiveSessionId(storedSessions[0].id);
        setMessages(storedSessions[0].messages || []);
      }

      // 3. Ping Server
      checkServerHealth();
    };

    initApp();

    // Listen for PWA install prompt
    if ((window as any).deferredInstallPrompt) {
      setInstallPrompt((window as any).deferredInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setInstallPrompt(e);
    };

    const handlePromptReady = (e: any) => {
      if (e.detail) {
        setInstallPrompt(e.detail);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const checkServerHealth = async () => {
    const startTime = Date.now();
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        const latency = Date.now() - startTime;
        setServerStatus({
          status: 'online',
          hasKey: data.hasKey ?? true,
          latencyMs: latency,
          serverTime: data.serverTime,
          model: data.model,
        });
      } else {
        setServerStatus({
          status: 'offline',
          hasKey: false,
          latencyMs: Date.now() - startTime,
        });
      }
    } catch {
      setServerStatus({
        status: 'offline',
        hasKey: false,
        latencyMs: 0,
      });
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    await saveStoredLanguage(newLang);
  };

  const handleModelChange = async (newModel: GeminiModelId) => {
    setSelectedModel(newModel);
    await saveStoredModel(newModel);
  };

  const handleNewChat = () => {
    setActiveSessionId('');
    setMessages([]);
  };

  const handleSelectSession = (id: string) => {
    const found = sessions.find((s) => s.id === id);
    if (found) {
      setActiveSessionId(found.id);
      setMessages(found.messages || []);
    }
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSessionFromDb(id);
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages || []);
      } else {
        handleNewChat();
      }
    }
  };

  const handleClearAllSessions = async () => {
    await clearAllLocalData();
    setSessions([]);
    handleNewChat();
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Main chat sending handler with background multimodal processing
  const handleSendMessage = async (
    text: string,
    image?: MediaAttachment,
    audio?: MediaAttachment
  ) => {
    const userMessageId = `msg_${Date.now()}_user`;
    const aiMessageId = `msg_${Date.now() + 1}_ai`;

    const userMessage: ChatMessageType = {
      id: userMessageId,
      role: 'user',
      text: text.trim(),
      image,
      audio,
      timestamp: Date.now(),
    };

    // Determine descriptive processing message
    let processingLabel = language === 'fa' 
      ? 'در حال پردازش هوشمند در پس‌زمینه با جمنای...' 
      : 'Processing in background with Gemini AI...';

    if (image && !audio) {
      processingLabel = language === 'fa'
        ? 'در حال بررسی و تحلیل دقیق تصویر با هوش مصنوعی...'
        : 'Analyzing image details with Gemini multimodal vision...';
    } else if (audio && !image) {
      processingLabel = language === 'fa'
        ? 'در حال گوش دادن به پیام صوتی و درک محتوا...'
        : 'Listening to audio message and processing context...';
    } else if (image && audio) {
      processingLabel = language === 'fa'
        ? 'در حال تحلیل همزمان تصویر و صوت در پس‌زمینه...'
        : 'Simultaneously analyzing image and audio input...';
    }

    const aiPlaceholder: ChatMessageType = {
      id: aiMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isProcessing: true,
      processingStatus: processingLabel,
    };

    const newMessages = [...messages, userMessage, aiPlaceholder];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          image,
          audio,
          history: historyPayload,
          language,
          model: selectedModel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred');
      }

      const finalAiMessage: ChatMessageType = {
        id: aiMessageId,
        role: 'model',
        text: data.text || (language === 'fa' ? 'پاسخی دریافت نشد.' : 'No response generated.'),
        timestamp: Date.now(),
        isProcessing: false,
        model: selectedModel,
      };

      const finalMessages = [...messages, userMessage, finalAiMessage];
      setMessages(finalMessages);

      // Persist to Offline Database (IndexedDB)
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        currentSessionId = `session_${Date.now()}`;
        setActiveSessionId(currentSessionId);
      }

      // Generate a friendly title from first message
      let title = text.slice(0, 36);
      if (!title) {
        if (image) title = language === 'fa' ? 'تحلیل تصویر' : 'Image Analysis';
        else if (audio) title = language === 'fa' ? 'پیام صوتی' : 'Voice Message';
        else title = language === 'fa' ? 'گفتگو جدید' : 'New Chat';
      }

      const updatedSession: Conversation = {
        id: currentSessionId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: finalMessages,
      };

      await saveSessionToDb(updatedSession);

      // Update sessions list
      const otherSessions = sessions.filter((s) => s.id !== currentSessionId);
      setSessions([updatedSession, ...otherSessions]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorAiMessage: ChatMessageType = {
        id: aiMessageId,
        role: 'model',
        text: language === 'fa'
          ? `⚠️ متاسفانه در پردازش پاسخ خطایی رخ داد: ${err.message || 'مشکل ارتباط با سرور'}`
          : `⚠️ Sorry, an error occurred while generating response: ${err.message || 'Server connection failure'}`,
        timestamp: Date.now(),
        isProcessing: false,
        error: err.message,
      };
      setMessages([...messages, userMessage, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080b] text-neutral-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        serverStatus={serverStatus}
        language={language}
        selectedModel={selectedModel}
        onOpenPanel={() => setIsPanelOpen(true)}
        onNewChat={handleNewChat}
        messageCount={messages.length}
      />

      {/* Main Chat Scroll Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
        {messages.length === 0 ? (
          <WelcomeScreen
            language={language}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            onOpenImage={() => imageTriggerRef.current?.()}
            onOpenVoice={() => voiceTriggerRef.current?.()}
          />
        ) : (
          <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 py-4 flex-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} language={language} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Floating / Sticky Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        language={language}
        onImageInputTrigger={(fn) => {
          imageTriggerRef.current = fn;
        }}
        onVoiceInputTrigger={(fn) => {
          voiceTriggerRef.current = fn;
        }}
      />

      {/* Slide-over Side Panel (سه نقطه) */}
      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        serverStatus={serverStatus}
        onRefreshServerStatus={checkServerHealth}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        installPrompt={installPrompt}
        onInstallApp={handleInstallApp}
      />
    </div>
  );
}
