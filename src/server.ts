import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Setup environment configuration
dotenv.config();

import { GeminiController } from './controllers/gemini.controller';
import { searchTracks, streamTrack } from './controllers/spotify.controller';

const app = express();
const port = process.env.PORT || 3000;

// Setup temp folder for uploads
const uploadDir = path.join(__dirname, '../temp_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Setup middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const geminiController = new GeminiController();

// Define Gemini Proxy API endpoints
app.post('/api/gemini/scan-odo', (req, res) => geminiController.scanOdo(req, res));
app.post('/api/gemini/chat', (req, res) => geminiController.chat(req, res));
app.post('/api/gemini/diagnose-video', upload.single('video'), (req, res) => geminiController.diagnoseVideo(req, res));

// Define Spotify API Search endpoint
app.get('/api/spotify/search', (req, res) => searchTracks(req, res));
app.get('/api/spotify/stream/:videoId', (req, res) => streamTrack(req, res));

app.get('/api/debug-cobalt', async (req, res) => {
  const videoUrl = 'https://www.youtube.com/watch?v=FvOpPeKSf_4';
  const apis = [
    'https://api.cobalt.liubquanti.click',
    'https://subito-c.meowing.de',
    'https://api.qwkuns.me'
  ];
  const logs: string[] = [];
  
  for (const api of apis) {
    try {
      logs.push(`Testing ${api}...`);
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl,
          downloadMode: 'audio',
          isAudioOnly: true,
          audioFormat: 'mp3'
        }),
        signal: AbortSignal.timeout(5000)
      });
      logs.push(`Status: ${response.status}`);
      const body = await response.text();
      logs.push(`Body: ${body.substring(0, 200)}`);
    } catch (e: any) {
      logs.push(`Error on ${api}: ${e.message}`);
    }
  }
  
  res.json({ logs });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// Start listening
app.listen(port, () => {
  console.log(`[MotoTune Backend] Server running on http://localhost:${port}`);
  console.log(`[MotoTune Backend] Offline and Gemini API requests proxied securely.`);
});
