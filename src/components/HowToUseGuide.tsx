import React from 'react';
import { X, Lightbulb, CheckCircle2, Film, Mic, Headphones } from 'lucide-react';

interface HowToUseGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseGuide: React.FC<HowToUseGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">راهنمای تولید صدای حرفه‌ای برای کلیپ‌های آموزشی</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <Mic className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">۱. انتخاب گوینده متناسب با موضوع</h4>
              <p className="text-slate-400">
                برای آموزش‌های جدی و دانشگاهی از «سارا» یا «بهرام» با لحن رسمی استفاده کنید. برای ویدیوهای ریلز، اینستاگرام یا معرفی ابزارها، گوینده «آرش» یا «نگین» با لحن عامیانه یا پرانرژی جذاب‌ترین تعامل را ایجاد می‌کند.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">۲. استفاده از برچسب‌های مکث بین اسلایدها</h4>
              <p className="text-slate-400">
                در کلیپ‌های آموزشی مغز شنونده نیاز به ۱ تا ۲ ثانیه فرصت پردازش دارد. با زدن دکمه‌های «+ مکث ۱ ثانیه» یا «+ مکث ۲ ثانیه» در متن، گوینده دقیقا متوقف شده و به اسلاید بعدی فرصت هماهنگی با تصویر را می‌دهد.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <Headphones className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">۳. اعراب‌گذاری کلمات دارای ایهام</h4>
              <p className="text-slate-400">
                اگر واژه‌ای دارید که ممکن است چند جور خوانده شود (مانند مُلک، مِلک یا مَلَک)، از نوار ابزار «اعراب‌یار» یا دکمه «اعراب‌گذاری خودکار» استفاده کنید تا تلفظ گوینده بدون کوچک‌ترین نقصی شکل گیرد.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <Film className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">۴. اضافه کردن به نرم‌افزارهای تدوین</h4>
              <p className="text-slate-400">
                فایل دانلود شده با فرمت استاندارد <strong>MP3 (192kbps)</strong> آماده است و می‌توانید مستقیماً آن را وارد نرم‌افزارهای پریمیر (Premiere)، کپ‌کات (CapCut)، اینشات (InShot) یا کمتازیا (Camtasia) کنید.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
          >
            متوجه شدم، بازگشت به استودیو
          </button>
        </div>
      </div>
    </div>
  );
};
