import React, { useState } from 'react';
import { Conversation, Language, ServerStatus, GeminiModelId } from '../types';
import { EmbossedLogo } from './EmbossedLogo';
import {
  X,
  Languages,
  Download,
  Share2,
  Activity,
  HardDrive,
  Trash2,
  MessageSquare,
  Check,
  RefreshCw,
  FileDown,
  Sparkles,
  ExternalLink,
  Cpu,
  Zap,
  FileArchive,
  Loader2,
  Smartphone,
  Bot,
  Info,
  Terminal,
  ArrowRight,
} from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedModel: GeminiModelId;
  onModelChange: (model: GeminiModelId) => void;
  serverStatus: ServerStatus;
  onRefreshServerStatus: () => void;
  sessions: Conversation[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  installPrompt: any;
  onInstallApp: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  selectedModel,
  onModelChange,
  serverStatus,
  onRefreshServerStatus,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAllSessions,
  installPrompt,
  onInstallApp,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshingPing, setIsRefreshingPing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadedZipSuccess, setDownloadedZipSuccess] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [copiedApkLink, setCopiedApkLink] = useState(false);

  if (!isOpen) return null;

  const isFa = language === 'fa';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const publicAppUrl =
    typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
      ? window.location.origin
      : 'https://ais-pre-ilcl3jmgzsaqpirb4xpkqa-347300675173.europe-west2.run.app';

  const apkGeneratorUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(publicAppUrl)}`;

  const handleOpenApkSite = () => {
    window.open(apkGeneratorUrl, '_blank');
  };

  const handleCopyApkLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(apkGeneratorUrl);
      } else {
        const input = document.createElement('input');
        input.value = apkGeneratorUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedApkLink(true);
      setTimeout(() => setCopiedApkLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy APK link:', err);
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      const res = await fetch('/api/download-zip');
      if (!res.ok) throw new Error('Download failed: ' + res.status);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = 'paradox-agi-project.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }, 200);
      setDownloadedZipSuccess(true);
      setTimeout(() => setDownloadedZipSuccess(false), 3500);
    } catch (err) {
      console.error('Download error:', err);
      // Direct navigation fallback
      window.location.href = '/api/download-zip';
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = window.location.href;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleRefreshPing = async () => {
    setIsRefreshingPing(true);
    await onRefreshServerStatus();
    setTimeout(() => setIsRefreshingPing(false), 600);
  };

  const handleExportData = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `paradox-agi-backup-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <aside
        className={`relative w-full max-w-sm sm:max-w-md h-full bg-[#0b0d11] border-s border-white/[0.08] shadow-2xl flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-out`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0e1015]">
          <div className="flex items-center gap-3">
            <EmbossedLogo size="sm" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isFa ? 'تنظیمات و امکانات' : 'Control & Settings'}</span>
              </h2>
              <p className="text-[10px] text-neutral-400">𝙋𝙖𝙧𝙖𝙙𝙤𝙭 AGI • MRG</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* SECTION 1: Language Switcher */}
          <div className="matte-panel rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 mb-3">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>{isFa ? 'تغییر زبان برنامه' : 'App Language'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onLanguageChange('fa')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                  language === 'fa'
                    ? 'bg-neutral-800 text-white border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold'
                    : 'bg-neutral-900/60 text-neutral-400 border border-white/[0.04] hover:text-neutral-200'
                }`}
              >
                <span>فارسی</span>
                {language === 'fa' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={() => onLanguageChange('en')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                  language === 'en'
                    ? 'bg-neutral-800 text-white border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold'
                    : 'bg-neutral-900/60 text-neutral-400 border border-white/[0.04] hover:text-neutral-200'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* SECTION 2: Model Selector */}
          <div className="matte-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>{isFa ? 'انتخاب مدل هوش مصنوعی (Gemini)' : 'Gemini AI Model Selection'}</span>
              </div>
              <span className="text-[10px] text-amber-400/90 font-mono bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">
                {selectedModel}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
              {isFa
                ? 'مدل مورد نظر خود را برای پاسخگویی به سوالات، تحلیل تصاویر و پردازش صدا انتخاب کنید:'
                : 'Select your preferred active Gemini model for queries, image reasoning, and voice processing:'}
            </p>

            <div className="space-y-2">
              {[
                {
                  id: 'gemini-3.8-flash' as const,
                  name: 'Gemini 3.8 Flash',
                  tag: isFa ? 'پیشنهادی • هوشمند و سریع' : 'Flagship • Fast & Smart',
                  desc: isFa ? 'جدیدترین مدل چندحالته نسل ۳ با درک عمیق متن، تصاویر و صوت' : 'Next-gen multimodal reasoning for text, images, and voice',
                  badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
                },
                {
                  id: 'gemini-3.1-flash-lite' as const,
                  name: 'Gemini 3.1 Flash Lite',
                  tag: isFa ? 'فوق‌العاده سریع و سبک' : 'Ultra-Fast',
                  desc: isFa ? 'حداقل تاخیر، پاسخ‌دهی آنی و سبک برای مکالمات' : 'Sub-second speed with low latency for fast queries',
                  badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
                },
                {
                  id: 'gemini-2.5-flash' as const,
                  name: 'Gemini 2.5 Flash',
                  tag: isFa ? 'نسل ۲.۵ پایدار' : 'Stable Gen 2.5',
                  desc: isFa ? 'مدل استاندارد و ارتقایافته (نسل پیشرفته و جایگزین سری ۱.۵)' : 'Proven 2.5 architecture (official modern successor to 1.5)',
                  badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
                },
              ].map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onModelChange(m.id)}
                    className={`w-full text-start p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-neutral-800/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                        : 'bg-neutral-900/50 border-white/[0.04] hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{m.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${m.badgeColor}`}>
                          {m.tag}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-neutral-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 p-2 rounded-xl bg-neutral-900/60 border border-white/[0.03] text-[10px] text-neutral-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                {isFa
                  ? 'نکته: مدل‌های ۲.۵ و ۳ نسل‌های بهینه‌تر و جایگزین رسمی نسخه‌های قدیمی ۱.۵ هستند و سرعت بسیار بالاتری دارند.'
                  : 'Note: Series 2.5 and 3 are official upgraded successors to legacy 1.5 with significantly faster latency.'}
              </span>
            </div>
          </div>

          {/* SECTION 3: Server Connection Status */}
          <div className="matte-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{isFa ? 'وضعیت اتصال به سرور هوش مصنوعی' : 'AI Server Connection Status'}</span>
              </div>

              <button
                onClick={handleRefreshPing}
                disabled={isRefreshingPing}
                title={isFa ? 'بروزرسانی وضعیت' : 'Refresh status'}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-white/[0.04]">
                <span className="text-[11px] text-neutral-400">{isFa ? 'وضعیت شبکه' : 'Network Status'}:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      serverStatus.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      serverStatus.status === 'online' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {serverStatus.status === 'online'
                      ? isFa ? 'آنلاین و متصل' : 'Online & Connected'
                      : isFa ? 'قطع ارتباط' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-white/[0.04]">
                <span className="text-[11px] text-neutral-400">{isFa ? 'زمان تاخیر (Latency)' : 'Ping Latency'}:</span>
                <span className="text-xs font-mono font-medium text-neutral-200">
                  {serverStatus.latencyMs} ms
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-white/[0.04]">
                <span className="text-[11px] text-neutral-400">{isFa ? 'موتور فعال' : 'Active Engine'}:</span>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                  {selectedModel}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Android App Direct Installation & Solution for 404 */}
          <div className="matte-panel rounded-2xl p-4 border border-emerald-500/40 bg-gradient-to-b from-[#0e161c] to-[#0a0d11] shadow-xl shadow-black/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'نصب مستقیم برنامه روی گوشی اندروید' : 'Direct Android App Install'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                100% تضمینی
              </span>
            </div>

            {/* Explanation of 404 error */}
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{isFa ? 'چرا سایت‌های خارجی ارور ۴۰۴ می‌دهند؟' : 'Why external sites show 404 error?'}</span>
              </div>
              <p className="text-neutral-300 text-[10.5px]">
                {isFa
                  ? 'سایت‌های تبدیل آنلاین به دلیل مسائل امنیتی سرورهای گوگل اجازه دسترسی به این برنامه را ندارند. بنابراین نیازی به رفتن به هیچ سایتی نیست! گوشی شما خودش این قابلیت را دارد:'
                  : 'External converters cannot access private Google containers. Your Android phone can install it directly without any 3rd party site:'}
              </p>
            </div>

            {/* STEP 1: Open in Standalone Chrome Tab */}
            <a
              href={typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-ilcl3jmgzsaqpirb4xpkqa-347300675173.europe-west2.run.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{isFa ? '۱. باز کردن در پنجره مستقل مرورگر کروم گوشی' : '1. Open in Standalone Chrome Tab'}</span>
            </a>

            {/* STEP 2: Install via Chrome / Samsung menu */}
            <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/20 space-y-2.5">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  ۲
                </span>
                <span>{isFa ? 'پیدا کردن گزینه نصب در مرورگر گوشی:' : 'Find Install in Browser Menu:'}</span>
              </div>

              {/* Troubleshooting why 3 dots aren't seen */}
              <div className="space-y-1.5 text-[11px] text-neutral-300 pr-1 leading-relaxed">
                <div className="p-2 rounded-lg bg-neutral-900/90 border border-white/[0.06] space-y-1">
                  <div className="font-bold text-amber-300 text-[10.5px]">
                    {isFa ? '🔍 اگر سه نقطه را در بالای کروم نمی‌بینید:' : 'If you do not see the 3 dots:'}
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[10.5px] text-neutral-300">
                    <li>
                      <strong className="text-white">{isFa ? 'زبان فارسی گوشی:' : 'Persian language:'}</strong>{' '}
                      {isFa ? 'در گوشی‌های فارسی، سه نقطه در «بالا سمت چپ» قرار دارد.' : 'Three dots are at the TOP-LEFT.'}
                    </li>
                    <li>
                      <strong className="text-white">{isFa ? 'گوشی‌های سامسونگ:' : 'Samsung phones:'}</strong>{' '}
                      {isFa ? 'منو در «پایین سمت راست» به شکل ۳ خط موازی (☰) است ➔ گزینه «افزودن صفحه به...» ➔ «صفحه اصلی».' : 'Menu is at the BOTTOM-RIGHT (☰) ➔ "Add page to" ➔ "Home screen".'}
                    </li>
                    <li>
                      <strong className="text-white">{isFa ? 'مخفی شدن نوار مرورگر:' : 'Hidden bar:'}</strong>{' '}
                      {isFa ? 'صفحه را کمی به سمت بالا بکشید (اسکرول به بالا) تا نوار منوی کروم دوباره ظاهر شود.' : 'Scroll up slightly to reveal the hidden browser toolbar.'}
                    </li>
                    <li>
                      <strong className="text-white">{isFa ? 'نام گزینه در منو:' : 'Menu item name:'}</strong>{' '}
                      {isFa ? 'ممکن است به جای نصب برنامه، نوشته باشد «افزودن به صفحه اصلی» (Add to Home screen).' : 'Look for "Add to Home screen" or "Install App".'}
                    </li>
                  </ul>
                </div>

                <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 font-bold text-emerald-300 text-center text-xs">
                  {isFa ? 'لمس گزینه «افزودن به صفحه اصلی» یا «نصب برنامه»' : 'Select "Add to Home screen" or "Install App"'}
                </div>
              </div>
            </div>

            {/* GUARANTEED METHOD: Convert ZIP to APK via AppsGeyser (No 404!) */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/50 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isFa ? 'روش تضمینی ساخت فایل نصبی APK (بدون ارور ۴۰۴):' : 'Guaranteed APK Generator (No 404):'}
                </span>
                <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  فایل خام APK
                </span>
              </div>

              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {isFa
                  ? 'سایت‌های آنلاین به لینک دسترسی ندارند اما فایل ZIP را مستقیم تبدیل به APK می‌کنند. با این ۲ مرحله فایل نصبی APK را دریافت کنید:'
                  : 'Convert the project ZIP directly into an installable APK package in 2 easy steps:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Step A: Download Project ZIP */}
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloadingZip}
                  className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 text-xs font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-60"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isDownloadingZip
                      ? isFa ? 'در حال دریافت زیپ...' : 'Downloading...'
                      : isFa ? '۱. دانلود فایل ZIP برنامه' : '1. Download Project ZIP'}
                  </span>
                </button>

                {/* Step B: Upload to AppsGeyser ZIP Converter */}
                <button
                  onClick={() => window.open('https://appsgeyser.com/create-zip-app/', '_blank')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isFa ? '۲. ورود به سایت ساخت APK' : '2. Open APK Builder'}</span>
                </button>
              </div>

              <div className="text-[10.5px] text-neutral-400 leading-relaxed bg-black/40 p-2 rounded-lg border border-white/[0.04]">
                {isFa
                  ? '💡 در سایت باز شده، فقط فایل زیپی که در مرحله ۱ دانلود کردید را آپلود کنید؛ سایت AppsGeyser مستقیماً فایل نصبی APK را تولید کرده و لینک دانلود آن را به شما می‌دهد.'
                  : 'Upload the ZIP file in AppsGeyser to instantly receive your compiled APK file.'}
              </div>
            </div>
          </div>

          {/* SECTION 4: Get App Source & ZIP Download */}
          <div className="matte-panel rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 mb-2">
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'دانلود سورس کد و لینک پروژه' : 'Download Project Source & Link'}</span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
              {isFa
                ? 'دانلود فایل زیپ کامل سورس یا اشتراک‌گذاری لینک مستقیم برنامه.'
                : 'Download complete source archive or share direct URL.'}
            </p>

            <div className="space-y-2">
              <button
                onClick={handleDownloadZip}
                disabled={isDownloadingZip}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-700/20 hover:from-amber-600/40 hover:to-amber-700/30 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isDownloadingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{isFa ? 'در حال آماده‌سازی و دانلود فایل ZIP...' : 'Preparing & Downloading ZIP...'}</span>
                  </>
                ) : downloadedZipSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">{isFa ? 'فایل ZIP با موفقیت دانلود شد!' : 'ZIP Downloaded Successfully!'}</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4 text-amber-400" />
                    <span>{isFa ? 'دانلود مستقیم سورس پروژه (فایل ZIP)' : 'Download Project Source (ZIP)'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyLink}
                className="embossed-button w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">{isFa ? 'لینک دانلود کپی شد!' : 'Link Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-neutral-300" />
                    <span>{isFa ? 'کپی لینک دانلود و اشتراک‌گذاری' : 'Copy Download & Web Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 5: Chat History & Offline Local Database */}
          <div className="matte-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span>{isFa ? 'دیتابیس آفلاین گفتگوها' : 'Offline Database & History'}</span>
              </div>
              <span className="text-[10px] text-purple-400/90 font-mono bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-500/20">
                {sessions.length} {isFa ? 'گفتگو' : 'chats'}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 mb-3">
              {isFa
                ? 'پیام‌ها و تصاویر به صورت محلی در حافظه گوشی شما ذخیره شده‌اند و حتی بدون اینترنت قابل مشاهده هستند.'
                : 'Conversations, images, and voice recordings are preserved in your device IndexedDB for offline retrieval.'}
            </p>

            {/* Session List */}
            <div className="max-h-52 overflow-y-auto space-y-1.5 mb-3 pr-1">
              {sessions.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-500">
                  {isFa ? 'هنوز گفتگویی ذخیره نشده است.' : 'No saved conversations yet.'}
                </div>
              ) : (
                sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  const dateStr = new Date(sess.updatedAt).toLocaleDateString(
                    isFa ? 'fa-IR' : 'en-US',
                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <div
                      key={sess.id}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-neutral-800/90 border-emerald-500/40 text-white'
                          : 'bg-neutral-900/50 border-white/[0.04] text-neutral-300 hover:bg-neutral-800/50'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectSession(sess.id);
                          onClose();
                        }}
                        className="flex-1 text-start overflow-hidden mr-2"
                      >
                        <div className="text-xs font-medium truncate">{sess.title}</div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span>
                            {sess.messages.length} {isFa ? 'پیام' : 'msgs'}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(sess.id);
                        }}
                        title={isFa ? 'حذف این گفتگو' : 'Delete chat'}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Database Actions */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <button
                onClick={handleExportData}
                disabled={sessions.length === 0}
                className="flex-1 py-1.5 px-2 rounded-xl bg-neutral-900 border border-white/[0.06] text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-40 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isFa ? 'خروجی فایل (JSON)' : 'Export Backup'}</span>
              </button>

              {confirmClear ? (
                <button
                  onClick={() => {
                    onClearAllSessions();
                    setConfirmClear(false);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-[11px] font-bold transition-colors"
                >
                  {isFa ? 'تایید حذف همه؟' : 'Confirm clear?'}
                </button>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  disabled={sessions.length === 0}
                  className="py-1.5 px-2 rounded-xl text-neutral-500 hover:text-rose-400 disabled:opacity-30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isFa ? 'پاک‌سازی دیتابیس' : 'Clear All'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Branding */}
        <div className="p-3 border-t border-white/[0.06] bg-[#090b0e] text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-medium">
            <span>𝙋𝙖𝙧𝙖𝙙𝙤𝙭 AGI</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-300 font-semibold">MRG Signature Edition</span>
          </div>
        </div>
      </aside>

      {/* MODAL 1: Android Direct Installation Guide */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f1217] border border-emerald-500/30 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isFa ? 'نصب مستقیم روی گوشی اندروید' : 'Direct Android Install'}
                </h3>
                <p className="text-[10px] text-emerald-400 font-mono">WebAPK Native Installation</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
              {isFa
                ? 'مرورگر کروم و سامسونگ اینترنت در گوشی‌های اندروید، این برنامه را به طور مستقیم به یک فایل بومی APK تبدیل کرده و در منوی برنامه‌های گوشی نصب می‌کنند:'
                : 'Modern Android browsers compile this PWA directly into a native WebAPK application package:'}
            </p>

            {isInIframe && (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all mb-4"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isFa ? 'باز کردن در پنجره مرورگر کروم (جهت فعال شدن نصب)' : 'Open in Chrome Browser to Enable Install'}</span>
              </a>
            )}

            <div className="space-y-3 mb-5 text-xs text-neutral-300">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/[0.04] flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ۱
                </div>
                <div>
                  <span className="font-semibold text-white">
                    {isFa ? 'منوی سه نقطه مرورگر:' : 'Browser Menu:'}
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isFa
                      ? 'در بالای صفحه مرورگر کروم، روی آیکون سه نقطه (⋮) بزنید.'
                      : 'Tap the three-dots (⋮) menu in the top-right corner of Chrome.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/[0.04] flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ۲
                </div>
                <div>
                  <span className="font-semibold text-white">
                    {isFa ? 'انتخاب گزینه نصب:' : 'Select Install:'}
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isFa
                      ? 'گزینه «افزودن به صفحه اصلی» یا «نصب برنامه» (Install App) را لمس کنید.'
                      : 'Tap "Add to Home screen" or "Install App".'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/[0.04] flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ۳
                </div>
                <div>
                  <span className="font-semibold text-white">
                    {isFa ? 'اجرای تمام‌صفحه و آفلاین:' : 'Full Native Experience:'}
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isFa
                      ? 'برنامه با آیکون اختصاصی P مات به گوشی شما افزوده شده و بدون نیاز به نوار مرورگر اجرا می‌شود.'
                      : 'The app icon is added to your app drawer and opens full-screen like a store app.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              {isFa ? 'متوجه شدم' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Raw APK Generation & Download (PWABuilder / Capacitor) */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f1217] border border-amber-500/30 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowApkModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isFa ? 'دریافت و ساخت فایل نصبی APK خام' : 'Standalone APK Package Generation'}
                </h3>
                <p className="text-[10px] text-amber-400 font-mono">PWABuilder & Capacitor Android</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-neutral-300">
              {/* Option A: 1-Click PWABuilder */}
              <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {isFa ? 'روش اول: تولید خودکار APK با PWABuilder (آنلاین)' : 'Option 1: Online APK via PWABuilder'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    رایگان و سریع
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isFa
                    ? 'سامانه PWABuilder (پروژه رسمی مایکروسافت) مشخصات Manifest و آیکون‌های برنامه را بررسی کرده و در عرض ۳۰ ثانیه فایل نصبی APK برای شما تولید می‌کند.'
                    : 'PWABuilder (official Microsoft tool) generates a ready-to-install Android APK package in seconds.'}
                </p>

                <a
                  href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.origin : ''
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isFa ? 'باز کردن ساخت APK در PWABuilder' : 'Generate APK via PWABuilder'}</span>
                </a>
              </div>

              {/* Option B: Capacitor / Native Studio */}
              <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-white/[0.06] space-y-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  {isFa ? 'روش دوم: ساخت APK از سورس با Capacitor' : 'Option 2: Build APK via Capacitor & Android Studio'}
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isFa
                    ? 'پس از دانلود فایل ZIP سورس پروژه، می‌توانید در سیستم خود با دستورات زیر خروجی APK بگیرید:'
                    : 'Run these commands inside the extracted project folder to compile APK with Android Studio:'}
                </p>

                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[10px] text-emerald-400 space-y-1 overflow-x-auto text-start dir-ltr">
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                  <div>npm run build</div>
                  <div>npx cap add android</div>
                  <div>npx cap open android</div>
                  <div className="text-neutral-500"># سپس در Android Studio گزینه Build &gt; Build APK را انتخاب کنید.</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => setShowApkModal(false)}
                className="py-1.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold"
              >
                {isFa ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
