import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ZipArchive } from 'archiver';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support larger payload for images and recorded audio
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/status', async (req, res) => {
  const startTime = Date.now();
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  
  res.json({
    status: 'online',
    hasKey,
    latencyMs: Date.now() - startTime,
    serverTime: new Date().toISOString(),
    currentDefaultModel: 'gemini-3.8-flash',
    supportedModels: [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        tagFa: 'پیشنهادی • هوشمندترین و سریع',
        tagEn: 'Flagship • Fast & Intelligent',
        descFa: 'جدیدترین مدل چندحالته با درک عمیق متن، تصاویر باکیفیت و صوت',
        descEn: 'Next-gen multimodal reasoning for text, images, and voice',
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        tagFa: 'فوق‌العاده سریع و سبک',
        tagEn: 'Ultra-Fast & Lightweight',
        descFa: 'پاسخ‌دهی آنی با حداقل مصرف، مناسب مکالمات سریع و متنی',
        descEn: 'Sub-second latency optimized for rapid interactive queries',
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        tagFa: 'نسل ۲.۵ پایدار',
        tagEn: 'Stable Gen 2.5',
        descFa: 'مدل محبوب و پایدار نسل ۲.۵ (جایگزین ارتقایافته نسخه‌های ۱.۵)',
        descEn: 'Mature Gen 2.5 architecture (upgraded replacement for 1.5)',
      },
    ],
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, image, audio, history, language = 'fa', model = 'gemini-3.8-flash' } = req.body;

    if (!prompt && !image && !audio) {
      return res.status(400).json({ error: 'پیام، عکس یا وویسی ارسال نشده است.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'کلید API جمنای (GEMINI_API_KEY) تنظیم نشده است. لطفاً کلید را در تنظیمات وارد کنید.',
      });
    }

    // Determine target model safely
    let targetModel = model;
    // Map legacy 1.5 requests to modern 2.5 or 3.8 models to adhere to @google/genai rules
    if (typeof targetModel === 'string' && targetModel.includes('1.5')) {
      targetModel = 'gemini-2.5-flash';
    }

    const allowedModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
    if (!allowedModels.includes(targetModel)) {
      targetModel = 'gemini-3.8-flash';
    }

    const systemInstruction = language === 'fa'
      ? `شما "𝙋𝙖𝙧𝙖𝙙𝙤𝙭 AGI" (هوش مصنوعی پارادوکس) هستید. یک دستیار هوش مصنوعی فوق‌العاده باهوش، خلاق، سریع و مودب که با امضای MRG همراه است. 
شما توانایی تحلیل عمیق متون، تصاویر و صداها را دارید.
به تمام پرسش‌ها با لحنی حرفه‌ای، شیوا، گرم و دقیق به زبان فارسی پاسخ دهید، مگر اینکه کاربر به انگلیسی صحبت کند. از نشانه‌گذاری‌های زیبا (Markdown)، پاراگراف‌بندی منظم و در صورت نیاز نکات برجسته یا کدها استفاده کن.`
      : `You are "𝙋𝙖𝙧𝙖𝙙𝙤𝙭 AGI" (Paradox AGI), an elite, highly intelligent, fast, and helpful AI assistant associated with MRG.
You can analyze text, images, and audio seamlessly. Respond with precision, clarity, and elegance using neat Markdown formatting.`;

    // Build contents array
    const parts: any[] = [];

    // Add image if attached
    if (image && image.data && image.mimeType) {
      // Clean base64 if it has data URL prefix
      const cleanBase64 = image.data.includes('base64,')
        ? image.data.split('base64,')[1]
        : image.data;

      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: cleanBase64,
        },
      });
    }

    // Add audio if attached
    if (audio && audio.data && audio.mimeType) {
      const cleanBase64 = audio.data.includes('base64,')
        ? audio.data.split('base64,')[1]
        : audio.data;

      parts.push({
        inlineData: {
          mimeType: audio.mimeType,
          data: cleanBase64,
        },
      });
    }

    // Add text prompt
    if (prompt && prompt.trim()) {
      parts.push({
        text: prompt.trim(),
      });
    } else if (audio && !prompt) {
      parts.push({
        text: language === 'fa' 
          ? 'لطفاً به این فایل صوتی با دقت گوش دهید، موضوع آن را متوجه شوید و پاسخی جامع، مفید و کامل به آن بدهید.' 
          : 'Please listen to this audio message carefully and respond helpfully and comprehensively.',
      });
    } else if (image && !prompt) {
      parts.push({
        text: language === 'fa' 
          ? 'لطفاً این تصویر را با دقت بررسی و تحلیل کرده و توضیحات یا نکات مهم مربوط به آن را شرح دهید.' 
          : 'Please analyze this image in detail and provide insights or answer any questions it presents.',
      });
    }

    // Build chat conversation structure with previous context if provided
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      // Include up to last 10 messages for conversational context
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text || '' }],
          });
        }
      }
    }

    // Append current turn
    contents.push({
      role: 'user',
      parts,
    });

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || (language === 'fa' ? 'پاسخی دریافت نشد.' : 'No response text received.');
    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({
      error: error?.message || 'خطایی در پردازش درخواست توسط هوش مصنوعی رخ داد.',
    });
  }
});

// Text-to-speech for generating spoken voice answers
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Shorten or summarize text for TTS if too long
    const cleanText = text.replace(/[*#`_~[\]()]/g, '').slice(0, 400);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({
        audio: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      res.status(500).json({ error: 'Failed to generate voice' });
    }
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// Download full project source as ZIP
app.get('/api/download-zip', async (req, res) => {
  try {
    const archive = new ZipArchive({
      zlib: { level: 9 },
    });

    res.attachment('paradox-agi-project.zip');
    res.setHeader('Content-Type', 'application/zip');

    archive.pipe(res);

    archive.glob('**/*', {
      cwd: __dirname,
      ignore: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '.env',
        '*.zip',
        '.DS_Store',
      ],
      dot: true,
    });

    await archive.finalize();
  } catch (err: any) {
    console.error('Error creating zip:', err);
    res.status(500).send('Failed to generate project zip');
  }
});

// Direct link/redirect to automated APK Generator
app.get('/api/download-apk', (req, res) => {
  const defaultPublicUrl = 'https://ais-pre-ilcl3jmgzsaqpirb4xpkqa-347300675173.europe-west2.run.app';
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;
  let targetUrl = defaultPublicUrl;

  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const proto = (req.headers['x-forwarded-proto'] || 'https') as string;
    targetUrl = `${proto}://${host}`;
  }

  const apkGeneratorUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(targetUrl)}`;
  res.redirect(302, apkGeneratorUrl);
});

// Setup Vite middleware for development or static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
