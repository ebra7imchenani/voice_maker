import React, { useState } from 'react';
import { Plus, Trash2, Layers, Volume2, Download, ArrowRight, Loader2 } from 'lucide-react';
import { SlideItem } from '../types/tts';

interface SlideScriptStudioProps {
  slides: SlideItem[];
  setSlides: React.Dispatch<React.SetStateAction<SlideItem[]>>;
  onApplyToMainEditor: (combinedText: string) => void;
  onGenerateSlideAudio: (slideId: string) => Promise<void>;
  onMergeAndDownloadAll: () => Promise<void>;
  isGeneratingMerge: boolean;
}

export const SlideScriptStudio: React.FC<SlideScriptStudioProps> = ({
  slides,
  setSlides,
  onApplyToMainEditor,
  onGenerateSlideAudio,
  onMergeAndDownloadAll,
  isGeneratingMerge,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'slides'>('slides');

  const addSlide = () => {
    const newId = `slide_${Date.now()}`;
    const newSlide: SlideItem = {
      id: newId,
      title: `اسلاید شماره ${slides.length + 1}`,
      text: '',
    };
    setSlides([...slides, newSlide]);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) return;
    setSlides(slides.filter((s) => s.id !== id));
  };

  const updateSlide = (id: string, field: 'title' | 'text', val: string) => {
    setSlides(
      slides.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: val };
        }
        return s;
      })
    );
  };

  const handleCombineAndApply = () => {
    const combined = slides
      .filter((s) => s.text.trim())
      .map((s) => `// ${s.title}\n${s.text}`)
      .join('\n\n[مکث ۲ ثانیه]\n\n');
    onApplyToMainEditor(combined);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-bold text-white">
              استودیوی اسلایدها و سناریوی کلیپ آموزشی (Multi-Scene)
            </h2>
            <p className="text-xs text-slate-400">
              مدیریت جداگانه اسلایدها، اسکریپت‌ها یا بخش‌های مختلف ویدیوی آموزشی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>افزودن اسلاید جدید</span>
          </button>
          <button
            type="button"
            onClick={handleCombineAndApply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            <span>انتقال همه به ویرایشگر اصلی</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slides list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3 relative group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-indigo-500 pb-0.5 w-full"
                  placeholder="عنوان اسلاید یا صحنه"
                />
              </div>

              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlide(slide.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                  title="حذف این اسلاید"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <textarea
              value={slide.text}
              onChange={(e) => updateSlide(slide.id, 'text', e.target.value)}
              rows={4}
              placeholder={`متن گویندگی مربوط به اسلاید ${index + 1} را اینجا بنویسید...`}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-['Vazirmatn']"
              dir="rtl"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{slide.text.trim() ? slide.text.trim().split(/\s+/).length : 0} کلمه</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onGenerateSlideAudio(slide.id)}
                  disabled={slide.isGenerating || !slide.text.trim()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 rounded-lg font-medium transition"
                >
                  {slide.isGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-amber-400" />
                  )}
                  <span>ساخت صدای این اسلاید</span>
                </button>

                {slide.audioUrl && (
                  <a
                    href={slide.audioUrl}
                    download={`${slide.title.replace(/\s+/g, '_')}.wav`}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
                    title="دانلود فایل WAV این اسلاید با کیفیت اصلی"
                  >
                    <Download className="w-3 h-3" />
                    <span>WAV</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
