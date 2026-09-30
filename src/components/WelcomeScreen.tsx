import React from 'react';
import { EmbossedLogo } from './EmbossedLogo';
import { Language } from '../types';
import { Sparkles, Image as ImageIcon, Mic, Code2, BrainCircuit } from 'lucide-react';

interface WelcomeScreenProps {
  language: Language;
  onSelectPrompt: (prompt: string) => void;
  onOpenVoice: () => void;
  onOpenImage: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onSelectPrompt,
  onOpenVoice,
  onOpenImage,
}) => {
  const isFa = language === 'fa';

  const suggestionPrompts = isFa
    ? [
        {
          icon: <BrainCircuit className="w-4 h-4 text-emerald-400" />,
          title: 'تحلیل و مشاوره هوشمند',
          desc: 'یک ایده نوآورانه برای ساخت اپلیکیشن به من بده',
        },
        {
          icon: <Code2 className="w-4 h-4 text-cyan-400" />,
          title: 'کدنویسی و توسعه',
          desc: 'یک اسکریپت کاربردی به زبان پایتون بنویس',
        },
        {
          icon: <ImageIcon className="w-4 h-4 text-purple-400" />,
          title: 'بررسی تصاویر و مدارک',
          desc: 'ارسال و تحلیل هوشمند تصویر یا سند',
          action: 'image',
        },
        {
          icon: <Mic className="w-4 h-4 text-rose-400" />,
          title: 'فرمان صوتی و ویس',
          desc: 'ارسال پیام صوتی و دریافت پاسخ صوتی',
          action: 'voice',
        },
      ]
    : [
        {
          icon: <BrainCircuit className="w-4 h-4 text-emerald-400" />,
          title: 'Strategic Ideation',
          desc: 'Give me 3 breakthrough startup concepts for 2026',
        },
        {
          icon: <Code2 className="w-4 h-4 text-cyan-400" />,
          title: 'Code Architecture',
          desc: 'Show me an optimized TypeScript debounce hook',
        },
        {
          icon: <ImageIcon className="w-4 h-4 text-purple-400" />,
          title: 'Image Analysis',
          desc: 'Analyze and explain any uploaded diagram or photo',
          action: 'image',
        },
        {
          icon: <Mic className="w-4 h-4 text-rose-400" />,
          title: 'Voice Reasoning',
          desc: 'Send a voice prompt and hear speech response',
          action: 'voice',
        },
      ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-2xl mx-auto w-full text-center select-none animate-in fade-in zoom-in-95 duration-500">
      {/* Matte Hero Emblem */}
      <div className="relative mb-6 group cursor-pointer">
        <div className="absolute -inset-4 bg-gradient-to-r from-neutral-800/20 via-neutral-700/10 to-neutral-900/30 rounded-full blur-xl -z-10 group-hover:opacity-100 opacity-60 transition-opacity" />
        <EmbossedLogo size="xl" animate={true} />
      </div>

      {/* Main Required Welcome Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
        {isFa ? (
          <>
            به هوش مصنوعی <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 font-extrabold">𝙋𝙖𝙧𝙖𝙙𝙤𝙭</span> خوش آمدید
          </>
        ) : (
          <>
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 font-extrabold">𝙋𝙖𝙧𝙖𝙙𝙤𝙭</span> AI
          </>
        )}
      </h1>

      {/* MRG Signature Badge directly below title */}
      <div className="mb-8 flex items-center justify-center">
        <div className="embossed-badge px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm font-black tracking-widest text-neutral-300 font-mono">
            MRG
          </span>
          <span className="text-[10px] text-neutral-500 font-normal px-1 py-0.5 rounded bg-black/40 border border-white/[0.04]">
            v2.6 AGI
          </span>
        </div>
      </div>

      {/* Subtle description */}
      <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
        {isFa
          ? 'پاسخگوی سریع به تمام سوالات شما، پردازش هوشمند تصویر، تحلیل صدا، کدنویسی و نگهداری آفلاین داده‌ها.'
          : 'Instant answers to all your inquiries, multimodal image inspection, voice interaction, and offline database persistence.'}
      </p>

      {/* Quick Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-start">
        {suggestionPrompts.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              if (item.action === 'image') {
                onOpenImage();
              } else if (item.action === 'voice') {
                onOpenVoice();
              } else {
                onSelectPrompt(item.desc);
              }
            }}
            className="embossed-button p-3.5 rounded-2xl text-start flex flex-col gap-1.5 transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-neutral-200 group-hover:text-white flex items-center gap-2">
                {item.icon}
                {item.title}
              </span>
              <span className="text-[10px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {isFa ? 'شروع ←' : 'Start →'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 line-clamp-1 group-hover:text-neutral-300">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
