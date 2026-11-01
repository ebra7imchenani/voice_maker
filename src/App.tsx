/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { TextEditor } from './components/TextEditor';
import { AudioPlayerCard } from './components/AudioPlayerCard';
import { SlideScriptStudio } from './components/SlideScriptStudio';
import { EducationalTemplatesModal } from './components/EducationalTemplatesModal';
import { HowToUseGuide } from './components/HowToUseGuide';
import { Gender, EngineType, GeneratedAudioResult, SlideItem } from './types/tts';
import { getBrowserVoices, speakBrowserText, stopBrowserSpeech } from './utils/browserTTS';
import { GEMINI_VOICES } from './data/voicesAndAccents';
import { History, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const INITIAL_TEXT = `سلام و درود به همه همراهان گرامی! به این ویدیوی آموزشی خیلی خوش آمدید. [مکث ۱ ثانیه]
در این جلسه قصد داریم یکی از کاربردی‌ترین مهارت‌ها را به صورت گام‌به‌گام و بسیار ساده با هم بررسی کنیم. [مکث ۲ ثانیه]
حتما قلم و کاغذ آماده داشته باشید تا نکات کلیدی را یادداشت کنید. بیایید بدون معطلی شروع کنیم!`;

const INITIAL_SLIDES: SlideItem[] = [
  {
    id: 'slide_1',
    title: 'اسلاید ۱: معرفی و عنوان آموزش',
    text: 'سلام دوستان عزیز! در این آموزش کوتاه قراره با هم یاد بگیریم چطور صدای حرفه‌ای برای کلیپ‌هایمان تولید کنیم. [مکث ۱ ثانیه]',
  },
  {
    id: 'slide_2',
    title: 'اسلاید ۲: نکته کلیدی و راهکار',
    text: 'مهم‌ترین نکته اینه که حتما بین جملات مکث مناسب قرار بدید تا یادگیرنده فرصت پردازش مطلب رو داشته باشه. [مکث ۲ ثانیه]',
  },
  {
    id: 'slide_3',
    title: 'اسلاید ۳: جمع‌بندی و اقدام',
    text: 'امیدوارم این آموزش براتون کاربردی بوده باشه. تا آموزش بعدی، خدانگهدار! [مکث ۱ ثانیه]',
  },
];

export default function App() {
  // Voice & Tone State
  const [gender, setGender] = useState<Gender>('female');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [accent, setAccent] = useState<string>('persian_standard');
  const [toneStyle, setToneStyle] = useState<string>('educational_formal');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<string>('normal');

  // Text & Mode State
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [engine, setEngine] = useState<EngineType>('gemini');
  const [modeTab, setModeTab] = useState<'single' | 'slides'>('single');

  // Generation & Player State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedAudioResult | null>(null);
  const [audioHistory, setAudioHistory] = useState<GeneratedAudioResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Slides State
  const [slides, setSlides] = useState<SlideItem[]>(INITIAL_SLIDES);
  const [isGeneratingMerge, setIsGeneratingMerge] = useState<boolean>(false);

  // Modals
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Browser voices
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    getBrowserVoices().then((voices) => {
      setBrowserVoices(voices);
      const faVoice = voices.find((v) => v.lang.startsWith('fa') || v.name.includes('Persian'));
      setSelectedBrowserVoice(faVoice || voices[0] || null);
    });
  }, []);

  // Main Generation Action
  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMsg('لطفا ابتدا متن مورد نظر خود را وارد کنید.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      if (engine === 'gemini') {
        const response = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: selectedVoice,
            gender,
            speed,
            toneStyle,
            accent,
            pitch,
          }),
        });

        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || 'خطایی در دریافت صوت از سرور رخ داد.');
        }

        // Process native WAV bytes
        const wavBinary = atob(data.audioBase64);
        const wavLen = wavBinary.length;
        const wavBytes = new Uint8Array(wavLen);
        for (let i = 0; i < wavLen; i++) {
          wavBytes[i] = wavBinary.charCodeAt(i);
        }
        const wavBlob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(wavBlob);

        const voiceObj = GEMINI_VOICES.find((v) => v.id === selectedVoice);
        const voiceLabel = voiceObj ? voiceObj.nameFa : selectedVoice;

        const result: GeneratedAudioResult = {
          audioUrl,
          wavBlob,
          duration: data.durationEstSec || 10,
          voiceName: voiceLabel,
          engine: 'gemini',
          date: new Date(),
          textSnippet: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
          filename: `educational_audio_${Date.now()}`,
        };

        setGeneratedResult(result);
        setAudioHistory((prev) => [result, ...prev.slice(0, 5)]);

        // Scroll smoothly to player
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 150);
      } else {
        // Browser Speech Synthesis
        speakBrowserText(
          text,
          selectedBrowserVoice,
          speed,
          pitch === 'high' ? 1.3 : pitch === 'low' ? 0.8 : 1.0,
          () => {
            setIsGenerating(false);
          },
          () => {
            setIsGenerating(false);
          },
          (err) => {
            setIsGenerating(false);
            console.error('Browser speech error:', err);
          }
        );
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      setErrorMsg(err?.message || 'خطایی در تولید صدا رخ داد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Script Enhancement (diacritics, pauses, colloquial, polish)
  const handleEnhance = async (mode: 'diacritics' | 'pauses' | 'colloquial' | 'polish') => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/tts/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'خطا در ویرایش هوشمند متن');
      }
      if (data.enhancedText) {
        setText(data.enhancedText);
      }
    } catch (err: any) {
      console.error('Enhance error:', err);
      setErrorMsg(err?.message || 'خطا در بهبود متن');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Slide Audio Generation
  const handleGenerateSlideAudio = async (slideId: string) => {
    const slide = slides.find((s) => s.id === slideId);
    if (!slide || !slide.text.trim()) return;

    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, isGenerating: true } : s))
    );

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: slide.text,
          voice: selectedVoice,
          gender,
          speed,
          toneStyle,
          accent,
          pitch,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error);

      // Create WAV blob
      const wavBinary = atob(data.audioBase64);
      const wavBytes = new Uint8Array(wavBinary.length);
      for (let i = 0; i < wavBinary.length; i++) {
        wavBytes[i] = wavBinary.charCodeAt(i);
      }
      const wavBlob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(wavBlob);

      setSlides((prev) =>
        prev.map((s) =>
          s.id === slideId
            ? {
                ...s,
                isGenerating: false,
                audioUrl,
                wavBlob,
                duration: data.durationEstSec,
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Slide generation error:', err);
      setSlides((prev) =>
        prev.map((s) => (s.id === slideId ? { ...s, isGenerating: false } : s))
      );
      setErrorMsg(`خطا در تولید صدای اسلاید: ${err?.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        engine={engine}
        setEngine={setEngine}
        onOpenTemplates={() => setShowTemplates(true)}
        onOpenGuide={() => setShowGuide(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Mode Switcher Tabs (Single Text vs Multi-Scene Slides) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setModeTab('single')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                modeTab === 'single'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📝 استودیوی متن و کلیپ یکپارچه
            </button>
            <button
              onClick={() => setModeTab('slides')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                modeTab === 'slides'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎬 سناریوی چند اسلایدی (Multi-Scene)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>خروجی آماده دانلود با فرمت استاندارد MP3</span>
          </div>
        </div>

        {/* Top Grid: Voice Selector */}
        <VoiceSelector
          gender={gender}
          setGender={setGender}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          accent={accent}
          setAccent={setAccent}
          toneStyle={toneStyle}
          setToneStyle={setToneStyle}
          speed={speed}
          setSpeed={setSpeed}
          pitch={pitch}
          setPitch={setPitch}
          engine={engine}
          browserVoices={browserVoices}
          selectedBrowserVoice={selectedBrowserVoice}
          setSelectedBrowserVoice={setSelectedBrowserVoice}
        />

        {/* Middle: Text Editor or Multi-Scene Studio */}
        {modeTab === 'single' ? (
          <TextEditor
            text={text}
            setText={setText}
            speed={speed}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onEnhance={handleEnhance}
            isEnhancing={isEnhancing}
          />
        ) : (
          <SlideScriptStudio
            slides={slides}
            setSlides={setSlides}
            onApplyToMainEditor={(combined) => {
              setText(combined);
              setModeTab('single');
            }}
            onGenerateSlideAudio={handleGenerateSlideAudio}
            onMergeAndDownloadAll={async () => {
              const combined = slides
                .filter((s) => s.text.trim())
                .map((s) => s.text)
                .join(' [مکث ۲ ثانیه] ');
              setText(combined);
              await handleGenerate();
            }}
            isGeneratingMerge={isGenerating}
          />
        )}

        {/* Audio Player and Download Card */}
        {generatedResult && (
          <div className="pt-2">
            <AudioPlayerCard result={generatedResult} onClear={() => setGeneratedResult(null)} />
          </div>
        )}

        {/* Recent Audio History (if any) */}
        {audioHistory.length > 1 && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <History className="w-4 h-4 text-indigo-400" />
              <span>تاریخچه فایل‌های صوتی تولید شده در این جلسه:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {audioHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">{item.voiceName}</span>
                    <span className="text-slate-500 font-mono">
                      {item.date.toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.textSnippet}</p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setGeneratedResult(item)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      پخش و کنترل
                    </button>
                    <a
                      href={item.audioUrl}
                      download={`${item.filename}.wav`}
                      className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                    >
                      دانلود WAV
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 mt-8 bg-slate-950/60 text-center text-xs text-slate-500">
        <p>
          استودیو تبدیل متن به گفتار و صداگذاری کلیپ‌های آموزشی | خروجی باکیفیت استودیویی WAV و پشتیبانی از گویندگان زن و مرد
        </p>
      </footer>

      {/* Modals */}
      <EducationalTemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(tmplText) => setText(tmplText)}
      />

      <HowToUseGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
