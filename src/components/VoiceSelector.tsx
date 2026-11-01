import React from 'react';
import { User, Mic2, Compass, Gauge, VolumeX, CheckCircle2, Sliders } from 'lucide-react';
import { Gender, EngineType } from '../types/tts';
import { GEMINI_VOICES, ACCENT_OPTIONS, TONE_OPTIONS } from '../data/voicesAndAccents';

interface VoiceSelectorProps {
  gender: Gender;
  setGender: (g: Gender) => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  accent: string;
  setAccent: (a: string) => void;
  toneStyle: string;
  setToneStyle: (t: string) => void;
  speed: number;
  setSpeed: (s: number) => void;
  pitch: string;
  setPitch: (p: string) => void;
  engine: EngineType;
  browserVoices: SpeechSynthesisVoice[];
  selectedBrowserVoice: SpeechSynthesisVoice | null;
  setSelectedBrowserVoice: (v: SpeechSynthesisVoice | null) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  gender,
  setGender,
  selectedVoice,
  setSelectedVoice,
  accent,
  setAccent,
  toneStyle,
  setToneStyle,
  speed,
  setSpeed,
  pitch,
  setPitch,
  engine,
  browserVoices,
  selectedBrowserVoice,
  setSelectedBrowserVoice,
}) => {
  // Filter Gemini voices by gender
  const filteredVoices = GEMINI_VOICES.filter((v) => v.gender === gender);

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    const firstVoiceOfGender = GEMINI_VOICES.find((v) => v.gender === newGender);
    if (firstVoiceOfGender) {
      setSelectedVoice(firstVoiceOfGender.id);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-6 shadow-xl backdrop-blur-sm">
      {/* Title & Gender Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">تنظیمات صدا و گوینده</h2>
        </div>

        {/* Gender Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleGenderChange('female')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gender === 'female'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-sm">👩</span>
            <span>گوینده زن</span>
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('male')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gender === 'male'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-sm">👨</span>
            <span>گوینده مرد</span>
          </button>
        </div>
      </div>

      {/* Voice Selection Cards (For Gemini Engine) */}
      {engine === 'gemini' ? (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>انتخاب کاراکتر و جنس صدا ({gender === 'female' ? 'خانم' : 'آقا'}):</span>
            <span className="text-[11px] text-slate-500">کیفیت استودیویی هوش مصنوعی</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {filteredVoices.map((voice) => {
              const isSelected = selectedVoice === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`text-right p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {voice.nameFa.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-100">{voice.nameFa}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {voice.nameEn}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {voice.description}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center flex-wrap gap-1">
                    {voice.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Browser Native Voices */
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            انتخاب صدای نصب شده در مرورگر / سیستم عامل:
          </label>
          {browserVoices.length > 0 ? (
            <select
              value={selectedBrowserVoice?.voiceURI || ''}
              onChange={(e) => {
                const found = browserVoices.find((v) => v.voiceURI === e.target.value);
                setSelectedBrowserVoice(found || null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {browserVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              صدای خاصی در مرورگر بارگذاری نشد. از موتور هوش مصنوعی استفاده کنید.
            </div>
          )}
        </div>
      )}

      {/* Accent & Tone Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accent / Dialect */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>لهجه و گویش:</span>
          </label>
          <div className="relative">
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {ACCENT_OPTIONS.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.flag} {acc.title}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-400 pr-1">
            {ACCENT_OPTIONS.find((a) => a.id === accent)?.description}
          </p>
        </div>

        {/* Tone & Inflection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>لحن و حالت گفتار (مخصوص کلیپ‌های آموزشی):</span>
          </label>
          <div className="relative">
            <select
              value={toneStyle}
              onChange={(e) => setToneStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {TONE_OPTIONS.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.emoji} {tone.title}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-400 pr-1">
            {TONE_OPTIONS.find((t) => t.id === toneStyle)?.description}
          </p>
        </div>
      </div>

      {/* Speed & Pitch Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-800/80">
        {/* Speed / Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              سرعت گفتار:
            </span>
            <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              {speed}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="1.75"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          {/* Quick Speed Chips */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setSpeed(0.8)}
              className={`px-2 py-0.5 rounded transition ${
                speed === 0.8 ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-slate-800'
              }`}
            >
              ۰.۸x (شمرده آموزشی)
            </button>
            <button
              type="button"
              onClick={() => setSpeed(1.0)}
              className={`px-2 py-0.5 rounded transition ${
                speed === 1.0 ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-slate-800'
              }`}
            >
              ۱.۰x (استاندارد)
            </button>
            <button
              type="button"
              onClick={() => setSpeed(1.25)}
              className={`px-2 py-0.5 rounded transition ${
                speed === 1.25 ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-slate-800'
              }`}
            >
              ۱.۲۵x (تند / اینستاگرام)
            </button>
          </div>
        </div>

        {/* Pitch / Timbre */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <VolumeX className="w-3.5 h-3.5 text-violet-400" />
              عمق و ارتفاع صدا (Pitch):
            </span>
            <span className="text-slate-400 text-[11px]">
              {pitch === 'low' ? 'بم و گرم' : pitch === 'high' ? 'زیر و شفاف' : 'متعادل و طبیعی'}
            </span>
          </div>

          {/* 3 Pitch buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPitch('low')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                pitch === 'low'
                  ? 'bg-violet-950/60 border-violet-500 text-violet-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              بم و عمیق
            </button>
            <button
              type="button"
              onClick={() => setPitch('normal')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                pitch === 'normal'
                  ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              طبیعی (معمولی)
            </button>
            <button
              type="button"
              onClick={() => setPitch('high')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                pitch === 'high'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              زیر و روشن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
