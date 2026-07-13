import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Setup environment configuration
dotenv.config();

import { GeminiController } from './controllers/gemini.controller';

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// Start listening
app.listen(port, () => {
  console.log(`[MotoTune Backend] Server running on http://localhost:${port}`);
  console.log(`[MotoTune Backend] Offline and Gemini API requests proxied securely.`);
});
