import React, { useState, useRef, useEffect } from 'react';
import { MediaAttachment, Language } from '../types';
import { AudioRecorder } from '../utils/audioRecorder';
import {
  SendHorizontal,
  Camera,
  Mic,
  Square,
  X,
  Image as ImageIcon,
  Sparkles,
  Paperclip,
  Check,
  Disc,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, image?: MediaAttachment, audio?: MediaAttachment) => Promise<void>;
  isLoading: boolean;
  language: Language;
  onImageInputTrigger?: (triggerFn: () => void) => void;
  onVoiceInputTrigger?: (triggerFn: () => void) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  language,
  onImageInputTrigger,
  onVoiceInputTrigger,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<MediaAttachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);

  const isFa = language === 'fa';

  // Expose trigger hooks for WelcomeScreen quick-action buttons
  useEffect(() => {
    if (onImageInputTrigger) {
      onImageInputTrigger(() => fileInputRef.current?.click());
    }
    if (onVoiceInputTrigger) {
      onVoiceInputTrigger(() => handleStartRecording());
    }
  }, [onImageInputTrigger, onVoiceInputTrigger]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      alert(isFa ? 'حجم تصویر نباید بیشتر از ۱۲ مگابایت باشد.' : 'Image size cannot exceed 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setAttachedImage({
        data: base64,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartRecording = async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }
      setRecordingSeconds(0);
      await recorderRef.current.start((secs) => setRecordingSeconds(secs));
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      alert(isFa ? 'دسترسی به میکروفون داده نشد یا میکروفون در دسترس نیست.' : 'Microphone access denied or unavailable.');
    }
  };

  const handleStopAndSendRecording = async () => {
    if (!recorderRef.current) return;
    try {
      const result = await recorderRef.current.stop();
      setIsRecording(false);
      setRecordingSeconds(0);

      // Send audio message directly to AI
      await onSendMessage('', undefined, {
        data: result.base64,
        mimeType: result.mimeType,
        duration: result.duration,
      });
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
    }
  };

  const handleCancelRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !attachedImage) || isLoading) return;

    const textToSend = inputText;
    const imgToSend = attachedImage || undefined;

    setInputText('');
    setAttachedImage(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(textToSend, imgToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4 pt-1 transition-all">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Input Outer Card */}
      <div className="matte-panel rounded-2xl p-2 sm:p-2.5 transition-all relative">
        {/* Attached Image Preview bar */}
        {attachedImage && (
          <div className="mb-2 p-2 rounded-xl bg-neutral-900/90 border border-white/[0.08] flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`}
                alt="Selected"
                className="w-10 h-10 rounded-lg object-cover border border-white/10"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-neutral-200 truncate">
                  {attachedImage.name || (isFa ? 'تصویر انتخاب‌شده' : 'Selected image')}
                </div>
                <div className="text-[10px] text-emerald-400">
                  {isFa ? 'آماده پردازش هوشمند در پس‌زمینه' : 'Ready for background AI analysis'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={isFa ? 'حذف تصویر' : 'Remove image'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Audio Recording Active Mode */}
        {isRecording ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/90 border border-rose-500/30 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-rose-400">
                <span>{formatTimer(recordingSeconds)}</span>
              </div>
              <span className="text-xs text-neutral-300 hidden sm:inline">
                {isFa ? 'در حال ضبط صدای شما...' : 'Recording voice message...'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Cancel Button */}
              <button
                onClick={handleCancelRecording}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
              >
                {isFa ? 'لغو' : 'Cancel'}
              </button>

              {/* Stop & Send Button */}
              <button
                onClick={handleStopAndSendRecording}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isFa ? 'ارسال ویس' : 'Send Voice'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Chat Input Mode */
          <div className="flex items-end gap-1.5 sm:gap-2">
            {/* Distinctive Image Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title={isFa ? 'ارسال عکس جهت پردازش هوشمند' : 'Send photo for AI analysis'}
              className="embossed-button p-2.5 rounded-xl text-neutral-400 hover:text-purple-300 transition-colors flex items-center justify-center flex-shrink-0 group"
            >
              <Camera className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Distinctive Voice Recording Button */}
            <button
              onClick={handleStartRecording}
              disabled={isLoading}
              title={isFa ? 'ارسال پیام صوتی (ویس)' : 'Record and send voice note'}
              className="embossed-button p-2.5 rounded-xl text-neutral-400 hover:text-rose-400 transition-colors flex items-center justify-center flex-shrink-0 group"
            >
              <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Textarea Input Field */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  isFa
                    ? 'هر سوالی دارید بپرسید یا عکس و ویس ارسال کنید...'
                    : 'Ask anything, or attach an image / voice note...'
                }
                disabled={isLoading}
                className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none resize-none py-2 px-2.5 leading-relaxed max-h-36 block"
              />
            </div>

            {/* Distinctive Embossed Send Button */}
            <button
              onClick={handleSend}
              disabled={(!inputText.trim() && !attachedImage) || isLoading}
              title={isFa ? 'ارسال پیام' : 'Send message'}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
                (inputText.trim() || attachedImage) && !isLoading
                  ? 'bg-gradient-to-r from-neutral-200 to-white text-neutral-900 shadow-[0_4px_14px_rgba(255,255,255,0.2)] hover:from-white hover:to-neutral-100 active:scale-95'
                  : 'bg-neutral-800/60 text-neutral-600 cursor-not-allowed border border-white/[0.03]'
              }`}
            >
              <SendHorizontal className={`w-5 h-5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sub-brand & Shortcuts */}
      <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-neutral-500 select-none">
        <span className="flex items-center gap-1 font-mono">
          <span>𝙋𝙖𝙧𝙖𝙙𝙤𝙭 AGI</span>
          <span>•</span>
          <span className="text-neutral-400">MRG</span>
        </span>
        <span className="hidden sm:inline">
          {isFa ? 'پردازش سریع با جمنای • ذخیره امن آفلاین در دستگاه' : 'Fast Gemini Multimodal • Encrypted Offline Cache'}
        </span>
      </div>
    </div>
  );
};
