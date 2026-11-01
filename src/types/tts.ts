export type Gender = 'male' | 'female';

export type EngineType = 'gemini' | 'browser';

export interface VoiceOption {
  id: string;
  nameFa: string;
  nameEn: string;
  gender: Gender;
  description: string;
  tags: string[];
  recommendedFor: string;
}

export interface AccentOption {
  id: string;
  title: string;
  flag: string;
  description: string;
}

export interface ToneOption {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

export interface SlideItem {
  id: string;
  title: string;
  text: string;
  audioBlob?: Blob;
  audioUrl?: string;
  wavBlob?: Blob;
  isGenerating?: boolean;
  duration?: number;
}

export interface GeneratedAudioResult {
  audioUrl: string;
  wavBlob: Blob;
  duration: number;
  voiceName: string;
  engine: EngineType;
  date: Date;
  textSnippet: string;
  filename: string;
}
