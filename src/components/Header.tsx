import React from 'react';
import { Volume2, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import { EngineType } from '../types/tts';

interface HeaderProps {
  engine: EngineType;
  setEngine: (engine: EngineType) => void;
  onOpenTemplates: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  engine,
  setEngine,
  onOpenTemplates,
  onOpenGuide,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                استودیو تبدیل متن به گفتار و صداگذاری آموزشی
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-amber-400" />
                صداگذاری حرفه‌ای ویدیو
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تولید صدای باکیفیت زن و مرد با لهجه‌ها و لحن‌های گوناگون + خروجی فایل صوتی WAV برای کلیپ‌ها
            </p>
          </div>
        </div>

        {/* Engine switcher and Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Engine Selector */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setEngine('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                engine === 'gemini'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="صدای باکیفیت استودیویی با هوش مصنوعی و لحن کاملا طبیعی"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              موتور هوش مصنوعی (استودیویی)
            </button>
            <button
              onClick={() => setEngine('browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                engine === 'browser'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="پخش سریع بومی مرورگر با صدای نصب شده روی سیستم شما"
            >
              موتور مرورگر (تست سریع)
            </button>
          </div>

          {/* Educational Templates Button */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>قالب‌های آماده کلیپ</span>
          </button>

          {/* Help Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
            title="راهنمای ساخت صدای حرفه‌ای برای کلیپ‌های آموزشی"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>راهنما</span>
          </button>
        </div>
      </div>
    </header>
  );
};
