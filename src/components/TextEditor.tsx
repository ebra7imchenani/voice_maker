import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Clock,
  Type,
  Pause,
  Wand2,
  Trash2,
  Copy,
  Check,
  Loader2,
  Volume2,
} from 'lucide-react';

interface TextEditorProps {
  text: string;
  setText: (t: string) => void;
  speed: number;
  onGenerate: () => void;
  isGenerating: boolean;
  onEnhance: (mode: 'diacritics' | 'pauses' | 'colloquial' | 'polish') => Promise<void>;
  isEnhancing: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  setText,
  speed,
  onGenerate,
  isGenerating,
  onEnhance,
  isEnhancing,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  // Helper to insert text at cursor position
  const insertAtCursor = (insertion: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newText = before + insertion + after;
    setText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  // Stats calculation
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Average speaking rate in Persian is around 130 words per minute
  const baseWordsPerMinute = 130 * speed;
  const estimatedSeconds = wordCount > 0 ? Math.round((wordCount / baseWordsPerMinute) * 60) : 0;
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    if (mins === 0) return `${remaining} ثانیه`;
    return `${mins} دقیقه و ${remaining} ثانیه`;
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      {/* Top Bar with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">متن آموزش یا سناریوی کلیپ</h2>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/60">
            {wordCount.toLocaleString('fa-IR')} کلمه
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/60">
            {charCount.toLocaleString('fa-IR')} حرف
          </span>
          <span className="bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            مدت تخمینی صدا: {formatTime(estimatedSeconds)}
          </span>
        </div>
      </div>

      {/* Persian Diacritics and Educational Pause Toolbar */}
      <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Pause insert buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Pause className="w-3 h-3 text-amber-400" />
              مکث‌های آموزشی:
            </span>
            <button
              type="button"
              onClick={() => insertAtCursor(' [مکث ۱ ثانیه] ')}
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition"
              title="ایجاد ۱ ثانیه سکوت بین نکات"
            >
              + مکث ۱ ثانیه
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor(' [مکث ۲ ثانیه] ')}
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition"
              title="ایجاد ۲ ثانیه سکوت بین اسلایدها"
            >
              + مکث ۲ ثانیه
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor(' [مکث ۳ ثانیه] ')}
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition"
              title="مکث ۳ ثانیه برای تعویض بخش"
            >
              + مکث ۳ ثانیه
            </button>
          </div>

          {/* Persian Vowels / اعراب‌یار سریع */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400">اعراب‌یار:</span>
            {[
              { label: 'َ', name: 'فتحه' },
              { label: 'ِ', name: 'کسره' },
              { label: 'ُ', name: 'ضمه' },
              { label: 'ّ', name: 'تشدید' },
              { label: 'ْ', name: 'ساکن' },
              { label: 'ً', name: 'تنوین' },
            ].map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => insertAtCursor(v.label)}
                className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-md border border-slate-700 transition"
                title={v.name}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Enhancers row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-indigo-400" />
              بهبود هوشمند سناریو:
            </span>
            <button
              type="button"
              disabled={isEnhancing || !text.trim()}
              onClick={() => onEnhance('diacritics')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs transition flex items-center gap-1"
              title="قراردادن خودکار اعراب روی کلمات مبهم جهت ادای ۱۰۰٪ صحیح"
            >
              {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨'}
              اعراب‌گذاری خودکار کلمات
            </button>
            <button
              type="button"
              disabled={isEnhancing || !text.trim()}
              onClick={() => onEnhance('pauses')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-300 border border-amber-500/30 rounded-lg text-xs transition flex items-center gap-1"
              title="افزودن خودکار مکث‌های طبیعی میان سرفصل‌ها و اسلایدها"
            >
              ⏱️ مکث‌گذاری آموزشی
            </button>
            <button
              type="button"
              disabled={isEnhancing || !text.trim()}
              onClick={() => onEnhance('colloquial')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs transition flex items-center gap-1"
              title="تبدیل متن به لحن روان و عامیانه ریلز و اینستاگرام"
            >
              🗣️ تبدیل به لحن عامیانه ریلز
            </button>
          </div>

          {/* Quick utility buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="کپی متن"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="پاک‌کردن متن"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="متن مورد نظر برای کلیپ آموزشی خود را اینجا تایپ یا پیست کنید...
برای مثال:
سلام دوستان عزیز، امروز قصد داریم روش حل این معادله را به صورت گام‌به‌گام با هم بررسی کنیم. [مکث ۱ ثانیه]
اولین قدم، مشخص کردن مجهولات مسئله است..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y font-['Vazirmatn']"
          dir="rtl"
        />
      </div>

      {/* Generate Button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-500 hidden sm:block">
          💡 برای بهترین نتیجه در کلیپ‌ها، از برچسب‌های [مکث] بین نکات کلیدی استفاده کنید.
        </p>

        <button
          type="button"
          disabled={isGenerating || !text.trim()}
          onClick={onGenerate}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all text-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
              <span>در حال تولید صدای گوینده و ساخت فایل صوتی...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-amber-300" />
              <span>تبدیل به گفتار و ایجاد فایل صوتی WAV (کیفیت استودیویی)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
