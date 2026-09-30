import React, { useState } from 'react';
import { ChatMessage as ChatMessageType, Language } from '../types';
import { EmbossedLogo } from './EmbossedLogo';
import { marked } from 'marked';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Loader2,
  Sparkles,
  Maximize2,
  X,
  Layers,
} from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  language: Language;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, language }) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsAudio, setTtsAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);

  const isUser = message.role === 'user';
  const isFa = language === 'fa';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const toggleUserAudio = () => {
    if (!message.audio?.data) return;

    if (audioElement) {
      if (isPlayingAudio) {
        audioElement.pause();
        setIsPlayingAudio(false);
      } else {
        audioElement.play();
        setIsPlayingAudio(true);
      }
    } else {
      const audioUrl = `data:${message.audio.mimeType};base64,${message.audio.data}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().then(() => {
        setIsPlayingAudio(true);
        setAudioElement(audio);
      }).catch(console.error);
    }
  };

  const handlePlayTts = async () => {
    if (isPlayingTts && ttsAudio) {
      ttsAudio.pause();
      setIsPlayingTts(false);
      return;
    }

    if (ttsAudio) {
      ttsAudio.play();
      setIsPlayingTts(true);
      return;
    }

    try {
      setIsGeneratingTts(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.text }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audio}`);
        audio.onended = () => setIsPlayingTts(false);
        audio.onerror = () => setIsPlayingTts(false);
        audio.play().then(() => {
          setIsPlayingTts(true);
          setTtsAudio(audio);
        });
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Safe markdown html
  const formattedHtml = React.useMemo(() => {
    if (!message.text) return '';
    try {
      return marked.parse(message.text, { async: false, breaks: true }) as string;
    } catch {
      return message.text;
    }
  }, [message.text]);

  const timeString = new Date(message.timestamp).toLocaleTimeString(
    isFa ? 'fa-IR' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div
      className={`flex gap-3 sm:gap-4 my-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 self-start">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-900 border border-white/10 flex items-center justify-center text-xs font-bold text-neutral-200 shadow-md">
            <span>U</span>
          </div>
        ) : (
          <EmbossedLogo size="sm" animate={false} />
        )}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name and Time Header */}
        <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-neutral-400">
          <span className="font-semibold text-neutral-300">
            {isUser ? (isFa ? 'شما' : 'You') : '𝙋𝙖𝙧𝙖𝙙𝙤𝙭 AGI'}
          </span>
          {!isUser && message.model && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-amber-300/80 border border-white/[0.06]">
              {message.model.replace('gemini-', '')}
            </span>
          )}
          <span className="text-neutral-600">•</span>
          <span className="font-mono text-[10px] text-neutral-500">{timeString}</span>
        </div>

        {/* Bubble Card */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl relative transition-all ${
            isUser
              ? 'bg-gradient-to-b from-[#1b1f28] to-[#12141a] border border-white/[0.09] text-neutral-100 shadow-[0_6px_16px_rgba(0,0,0,0.5)]'
              : 'matte-panel text-neutral-200 shadow-[0_8px_20px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Background Processing Indicator Badge */}
          {message.isProcessing && (
            <div className="mb-3 p-2.5 rounded-xl bg-neutral-900/90 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-400 shadow-inner">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {message.processingStatus || (isFa ? 'پردازش در پس‌زمینه با هوش مصنوعی جمنای...' : 'Processing in background with Gemini...')}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isFa ? 'پردازش سریع و بدون مسدودسازی رابط کاربری' : 'Non-blocking background reasoning'}
                </span>
              </div>
            </div>
          )}

          {/* Attached Image Thumbnail */}
          {message.image?.data && (
            <div className="mb-3 relative group">
              <div
                onClick={() => setShowEnlargedImage(true)}
                className="cursor-pointer overflow-hidden rounded-xl border border-white/10 max-w-xs max-h-60 bg-black/40 relative"
              >
                <img
                  src={`data:${message.image.mimeType};base64,${message.image.data}`}
                  alt={message.image.name || 'Attached photo'}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-1.5 rounded-lg bg-black/70 text-white text-xs flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{isFa ? 'مشاهده بزرگ' : 'Expand'}</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>{message.image.name || (isFa ? 'تصویر ارسال‌شده' : 'Attached image')}</span>
              </div>
            </div>
          )}

          {/* Attached Audio Player (Voice Message) */}
          {message.audio?.data && (
            <div className="mb-3 p-2.5 rounded-xl bg-neutral-900/90 border border-white/[0.08] flex items-center gap-3">
              <button
                onClick={toggleUserAudio}
                className="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center transition-colors"
                title={isPlayingAudio ? 'Pause' : 'Play'}
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-1 h-5">
                  {/* Visualizer bars */}
                  {[40, 70, 30, 85, 50, 95, 60, 45, 80, 65, 90, 40].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        isPlayingAudio ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
                      }`}
                      style={{ height: `${isPlayingAudio ? Math.max(20, Math.round(h * Math.random())) : h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-1">
                  <span>{isFa ? 'پیام صوتی (ویس)' : 'Voice Note'}</span>
                  {message.audio.duration && <span>{message.audio.duration}s</span>}
                </div>
              </div>
            </div>
          )}

          {/* Text Message Content */}
          {message.text && (
            <div
              className="prose-dark text-sm sm:text-[14px] leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />
          )}

          {/* Model Actions Bar (Copy & TTS) */}
          {!isUser && !message.isProcessing && message.text && (
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-neutral-400">
              <div className="flex items-center gap-1.5">
                {/* Copy Text */}
                <button
                  onClick={handleCopy}
                  title={isFa ? 'کپی متن پاسخ' : 'Copy answer'}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{isFa ? 'کپی شد' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isFa ? 'کپی' : 'Copy'}</span>
                    </>
                  )}
                </button>

                {/* Text To Speech Playback */}
                <button
                  onClick={handlePlayTts}
                  disabled={isGeneratingTts}
                  title={isFa ? 'پخش صوتی متن با هوش مصنوعی' : 'Read aloud with AI'}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-[11px]"
                >
                  {isGeneratingTts ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  ) : isPlayingTts ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400">{isFa ? 'توقف پخش' : 'Stop'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isFa ? 'پخش صوتی' : 'Speak'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Paradox Signature Indicator */}
              <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 select-none">
                <Sparkles className="w-2.5 h-2.5 text-neutral-600" />
                <span>MRG</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enlarged Image Lightbox Modal */}
      {showEnlargedImage && message.image?.data && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowEnlargedImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowEnlargedImage(false)}
              className="absolute -top-10 end-0 p-1.5 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={`data:${message.image.mimeType};base64,${message.image.data}`}
              alt="Enlarged preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
