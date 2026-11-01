import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI client (Server-side only)
function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Style description builder for TTS
function buildStylePrompt(params: {
  gender?: string;
  accent?: string;
  toneStyle?: string;
  speed?: number;
  pitch?: string;
}): string {
  const parts: string[] = [];

  // Accent mapping
  switch (params.accent) {
    case 'persian_colloquial':
      parts.push('Informal colloquial conversational Persian (فارسی محاوره‌ای و عامیانه تهران)');
      break;
    case 'persian_dari':
      parts.push('Afghan Persian Dari dialect (گویش دری افغانستان) with respectful and melodious cadence');
      break;
    case 'persian_tajik':
      parts.push('Tajik Persian dialect (گویش تاجیکی)');
      break;
    case 'english_academic':
      parts.push('Fluent English with clear academic pronunciation');
      break;
    case 'arabic_accent':
      parts.push('Fusha Arabic pronunciation with proper phonetics');
      break;
    case 'persian_standard':
    default:
      parts.push('Standard contemporary Persian (فارسی معیار تهران) with crisp, articulate pronunciation');
      break;
  }

  // Tone style mapping
  switch (params.toneStyle) {
    case 'friendly_teacher':
      parts.push('Warm, encouraging, and friendly educational tutor for online video tutorials (معلم مهربان و صمیمی)');
      break;
    case 'news_anchor':
      parts.push('Authoritative, poised, and articulate news presenter/documentary voice (گوینده رسمی خبر و مستند)');
      break;
    case 'story_expressive':
      parts.push('Dramatic, expressive, and captivating storyteller with emotional depth (راوی داستانی پر احساس)');
      break;
    case 'energetic_motivational':
      parts.push('Inspiring, high-energy, and confident motivational speaker (انگیزشی و پرانرژی)');
      break;
    case 'calm_meditation':
      parts.push('Gentle, soothing, peaceful, and relaxed voice (آرامش‌بخش و لطیف)');
      break;
    case 'educational_formal':
    default:
      parts.push('Professional, pedagogical, clear academic presenter for educational slides and instructional video (آموزشی رسمی و شیوا)');
      break;
  }

  // Speed
  if (params.speed) {
    if (params.speed < 0.85) {
      parts.push('Deliberate, slow, and carefully articulated pace for language learners');
    } else if (params.speed > 1.15) {
      parts.push('Brisk, rapid, dynamic speaking tempo');
    } else {
      parts.push('Natural, well-paced educational cadence');
    }
  }

  // Pitch
  if (params.pitch === 'high') {
    parts.push('Slightly higher pitch, bright and clear timbre');
  } else if (params.pitch === 'low') {
    parts.push('Deep, resonant, warm baritone timbre');
  }

  return parts.join(', ');
}

// Map requested voice names to available Gemini prebuilt voices
const VALID_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'];

function resolveVoiceName(voice?: string, gender?: string): string {
  if (voice && VALID_VOICES.includes(voice)) {
    return voice;
  }
  // Default based on gender
  if (gender === 'female') {
    return 'Kore'; // Kore or Aoede or Zephyr
  }
  return 'Puck'; // Puck or Charon or Fenrir
}

// POST /api/tts/generate
app.post('/api/tts/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice, gender, speed, toneStyle, accent, pitch } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'متن برای تبدیل به گفتار وارد نشده است.' });
    }

    const cleanText = text
      .replace(/\[مکث(?:\s*(\d+)\s*ثانیه)?\]/g, '... ') // Replace pauses with ellipsis
      .replace(/\[pause(?:\s*(\d+)s)?\]/gi, '... ')
      .trim();

    const selectedVoice = resolveVoiceName(voice, gender);
    const styleDescription = buildStylePrompt({ gender, accent, toneStyle, speed, pitch });

    const ai = getGenAIClient();

    // Call gemini-3.8-flash-lite-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: styleDescription,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'صوت از مدل دریافت نشد. لطفا دوباره تلاش کنید.' });
    }

    res.json({
      success: true,
      audioBase64: base64Audio, // WAV (audio/wav, 24kHz mono 16-bit)
      mimeType: 'audio/wav',
      voiceUsed: selectedVoice,
      durationEstSec: Math.max(1, Math.round(cleanText.length / 15)),
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    const msg = error?.message || 'خطایی در پردازش صدا رخ داد.';
    res.status(500).json({ error: msg });
  }
});

// POST /api/tts/enhance-text
// AI assistant for educational scripts: adds Persian vowels/diacritics, inserts pauses, or improves educational flow
app.post('/api/tts/enhance-text', async (req: Request, res: Response) => {
  try {
    const { text, mode } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'متنی ارسال نشده است.' });
    }

    const ai = getGenAIClient();

    let prompt = '';
    if (mode === 'diacritics') {
      prompt = `به عنوان یک متخصص زبان و ادبیات فارسی، کلمات مبهم، سخت یا با احتمال خوانش اشتباه در این متن را با دقت اعراب‌گذاری کن (فتحه، کسره، ضمه، تشدید و ساکن در جای لازم قرار بده) تا موتور تبدیل متن به صدا (TTS) آن را کاملاً دقیق، روان و صحیح تلفظ کند. ساختار جملات را تغییر نده. فقط متن اصلاح شده با اعراب مناسب را برگردان.

متن ورودی:
${text}`;
    } else if (mode === 'pauses') {
      prompt = `به عنوان یک تدوین‌گر صدا و کارگردان کلیپ‌های آموزشی، در متن زیر در جاهایی که برای درک بهتر مخاطب نیاز به مکث کوتاه یا تعویض اسلاید است، علامت [مکث ۱ ثانیه] یا [مکث ۲ ثانیه] اضافه کن. تیترها، نکات کلیدی و تغییر موضوعات را با مکث مناسب جدا کن تا خروجی صوتی حرفه‌ای و بدون عجله به نظر برسد. فقط متن ویرایش شده را برگردان.

متن ورودی:
${text}`;
    } else if (mode === 'colloquial') {
      prompt = `این متن آموزشی را به لحن محاوره‌ای، صمیمی، روان و بسیار جذاب برای ویدیوهای یوتیوب یا ریلز/اینستاگرام تبدیل کن. واژه‌های تخصصی را حفظ کن ولی سبک صحبت را گرم و گیرا کن. فقط متن بازنویسی شده را برگردان:

متن ورودی:
${text}`;
    } else {
      prompt = `این متن را برای گویندگی یک کلیپ ویدیویی آموزشی ویراستاری کن: جملات را روان، بدون پیچیدگی بیهوده و با نظمی جذاب تنظیم کن تا شنونده به راحتی متوجه شود. فقط متن ویرایش شده را برگردان:

متن ورودی:
${text}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const enhanced = response.text?.trim() || text;
    res.json({ enhancedText: enhanced });
  } catch (err: any) {
    console.error('Enhance text error:', err);
    res.status(500).json({ error: err?.message || 'خطا در ویرایش متن' });
  }
});

// Configure Vite integration
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TTS Server is running on port ${PORT}`);
  });
}

setupServer();
