import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  FileAudio,
  Check,
  Share2,
} from 'lucide-react';
import { GeneratedAudioResult } from '../types/tts';

interface AudioPlayerCardProps {
  result: GeneratedAudioResult;
  onClear?: () => void;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({ result, onClear }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(result.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Animated visualizer bars
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate pseudo waveform bars based on text length and seed
    const bars: number[] = [];
    for (let i = 0; i < 48; i++) {
      const h = Math.sin(i * 0.3) * 35 + Math.cos(i * 0.7) * 20 + 45;
      bars.push(Math.max(15, Math.min(95, h)));
    }
    setWaveformBars(bars);
  }, [result]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    const blob = result.wavBlob;
    const filename = `${result.filename || 'educational_clip_audio'}.wav`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-indigo-500/40 p-5 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden HTML audio element */}
      <audio ref={audioRef} src={result.audioUrl} preload="auto" />

      {/* Top Details Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md">
            <FileAudio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">فایل صوتی استودیویی آماده دانلود</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                فرمت باکیفیت استودیویی WAV
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              گوینده: <span className="text-slate-200 font-semibold">{result.voiceName}</span> | کیفیت:{' '}
              <span className="text-slate-200 font-mono">24kHz 16-bit Lossless</span> | مدت زمان:{' '}
              <span className="text-slate-200 font-mono">{formatSeconds(duration || result.duration)}</span>
            </p>
          </div>
        </div>

        {/* Primary WAV Download Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>دانلود شد!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>دانلود فایل صوتی (WAV با کیفیت عالی)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 relative z-10 space-y-3">
        <div className="h-16 flex items-center justify-between gap-1 px-2 overflow-hidden">
          {waveformBars.map((barHeight, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isPassed = barProgress <= activeProgressPercent;

            return (
              <div
                key={idx}
                className="flex-1 flex items-center justify-center h-full cursor-pointer group"
                onClick={() => {
                  if (!audioRef.current || !duration) return;
                  const newTime = (idx / waveformBars.length) * duration;
                  audioRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
              >
                <div
                  style={{
                    height: isPlaying ? `${Math.min(100, barHeight * (0.8 + Math.random() * 0.4))}%` : `${barHeight}%`,
                  }}
                  className={`w-full max-w-[6px] rounded-full transition-all duration-150 ${
                    isPassed
                      ? 'bg-gradient-to-t from-indigo-500 to-amber-400 shadow-sm shadow-indigo-500/50'
                      : 'bg-slate-800 group-hover:bg-slate-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Seek Track */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>
      </div>

      {/* Audio Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 relative z-10">
        {/* Play / Pause / Replay */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-transform active:scale-95"
            title={isPlaying ? 'توقف' : 'پخش'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 mr-0.5" />}
          </button>
          <button
            type="button"
            onClick={handleReplay}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            title="پخش مجدد از ابتدا"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Playback Speed Multiplier */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 px-2">سرعت پخش:</span>
          {[0.8, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-1 rounded-lg font-mono transition ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition"
            title={isMuted ? 'وصل صدا' : 'قطع صدا'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
