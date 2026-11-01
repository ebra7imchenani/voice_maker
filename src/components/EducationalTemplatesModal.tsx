import React from 'react';
import { X, BookOpen, Check } from 'lucide-react';
import { EDUCATIONAL_TEMPLATES } from '../data/voicesAndAccents';

interface EducationalTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (text: string) => void;
}

export const EducationalTemplatesModal: React.FC<EducationalTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">قالب‌های آماده برای کلیپ‌های آموزشی</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-slate-400 leading-relaxed">
            یکی از متن‌های نمونه زیر را انتخاب کنید تا مستقیماً به ویرایشگر اضافه شود. این متن‌ها با
            مکث‌های بهینه و لحن استاندارد آموزشی طراحی شده‌اند:
          </p>

          <div className="space-y-3">
            {EDUCATIONAL_TEMPLATES.map((tmpl, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 space-y-2 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {tmpl.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{tmpl.title}</h4>
                  </div>
                  <button
                    onClick={() => {
                      onSelectTemplate(tmpl.text);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                  >
                    <span>استفاده از این قالب</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-['Vazirmatn'] line-clamp-3">
                  {tmpl.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
