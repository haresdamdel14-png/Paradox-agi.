import React from 'react';
import { EmbossedLogo } from './EmbossedLogo';
import { ServerStatus, Language, GeminiModelId } from '../types';
import { MoreVertical, Plus, Wifi, WifiOff, Cpu } from 'lucide-react';

interface HeaderProps {
  serverStatus: ServerStatus;
  language: Language;
  selectedModel: GeminiModelId;
  onOpenPanel: () => void;
  onNewChat: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  serverStatus,
  language,
  selectedModel,
  onOpenPanel,
  onNewChat,
  messageCount,
}) => {
  const isFa = language === 'fa';

  const modelShortName =
    selectedModel === 'gemini-3.8-flash'
      ? '3.8 Flash'
      : selectedModel === 'gemini-3.1-flash-lite'
      ? '3.1 Lite'
      : '2.5 Flash';

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#08090d]/85 border-b border-white/[0.07] px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Branding & Logo */}
        <div className="flex items-center gap-3">
          <EmbossedLogo size="sm" animate={true} />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 select-none">
                𝙋𝙖𝙧𝙖𝙙𝙤𝙭 <span className="font-extrabold tracking-wider text-xs sm:text-sm bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-700/80">AGI</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isFa ? 'هوش مصنوعی پیشرفته' : 'Advanced Intelligence'}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400 font-medium">MRG</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Model Pill Badge */}
          <button
            onClick={onOpenPanel}
            title={isFa ? `مدل فعال: ${selectedModel} (کلیک برای تغییر مدل)` : `Active: ${selectedModel} (Click to switch)`}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-neutral-900/90 border border-white/[0.08] hover:border-amber-500/40 text-[11px] text-neutral-300 transition-colors"
          >
            <Cpu className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="font-mono text-[10px] text-amber-300/90 font-semibold">
              {modelShortName}
            </span>
          </button>

          {/* New Chat Button */}
          {messageCount > 0 && (
            <button
              onClick={onNewChat}
              title={isFa ? 'گفتگوی جدید' : 'New Chat'}
              className="embossed-button flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFa ? 'گفتگوی جدید' : 'New Chat'}</span>
            </button>
          )}

          {/* Connection Status Pill */}
          <div
            title={
              serverStatus.status === 'online'
                ? isFa ? `سرور متصل است (${serverStatus.latencyMs}ms)` : `Connected (${serverStatus.latencyMs}ms)`
                : isFa ? 'عدم اتصال به سرور' : 'Offline'
            }
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900/80 border border-white/[0.06] text-[11px] text-neutral-400"
          >
            {serverStatus.status === 'online' ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-mono text-[10px]">{serverStatus.latencyMs}ms</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span className="text-amber-400">{isFa ? 'آفلاین' : 'Offline'}</span>
              </>
            )}
          </div>

          {/* Three Dots Menu Button (سه نقطه) */}
          <button
            onClick={onOpenPanel}
            aria-label={isFa ? 'منوی تنظیمات و امکانات' : 'Menu & Settings'}
            className="embossed-button p-2 rounded-xl text-neutral-300 hover:text-white flex items-center justify-center relative group"
          >
            <MoreVertical className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500/80 ring-2 ring-[#08090d]" />
          </button>
        </div>
      </div>
    </header>
  );
};
