/**
 * Web Speech API helper for native browser speech synthesis
 */

export interface BrowserVoice {
  voice: SpeechSynthesisVoice;
  lang: string;
  name: string;
  isDefault: boolean;
}

export function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const onVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(voices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

export function speakBrowserText(
  text: string,
  voice: SpeechSynthesisVoice | null,
  rate: number = 1.0,
  pitch: number = 1.0,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip custom bracket pause tags for speech engine
  const cleanText = text
    .replace(/\[مکث(?:\s*(\d+)\s*ثانیه)?\]/g, '... ')
    .replace(/\[pause(?:\s*(\d+)s)?\]/gi, '... ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    // Try to set Persian language tag
    utterance.lang = 'fa-IR';
  }

  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  utterance.pitch = Math.max(0.5, Math.min(1.8, pitch));

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopBrowserSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
