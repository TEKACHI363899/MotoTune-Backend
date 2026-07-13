import { Request, Response } from 'express';
import fs from 'fs';
import { GeminiService } from '../services/gemini.service';

const geminiService = new GeminiService();

export class GeminiController {
  
  /**
   * Post endpoint to scan ODO mileage
   */
  async scanOdo(req: Request, res: Response): Promise<void> {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        res.status(400).json({ error: "base64Image is required" });
        return;
      }

      const odoResult = await geminiService.scanOdo(base64Image);
      res.json({ odo: odoResult });
    } catch (error: any) {
      console.error("scanOdo controller error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  /**
   * Post endpoint for chat AI bot response
   */
  async chat(req: Request, res: Response): Promise<void> {
    try {
      const { messages, userMessage, systemPrompt } = req.body;
      if (!userMessage || !systemPrompt) {
        res.status(400).json({ error: "userMessage and systemPrompt are required" });
        return;
      }

      const chatHistory = Array.isArray(messages) ? messages : [];
      const reply = await geminiService.getChatResponse(chatHistory, userMessage, systemPrompt);
      res.json({ reply });
    } catch (error: any) {
      console.error("chat controller error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  /**
   * Post endpoint to diagnose engine noise using uploaded video
   */
  async diagnoseVideo(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const { systemPrompt } = req.body;

      if (!file) {
        res.status(400).json({ error: "video file is required" });
        return;
      }
      if (!systemPrompt) {
        res.status(400).json({ error: "systemPrompt is required" });
        return;
      }

      const diagnosis = await geminiService.diagnoseVideo(file.path, systemPrompt);

      // Clean up temporary uploaded file asynchronously
      fs.unlink(file.path, (err) => {
        if (err) console.error("Temp file clean up error:", err);
      });

      res.json({ diagnosis });
    } catch (error: any) {
      console.error("diagnoseVideo controller error:", error);
      
      // Clean up file if it exists on error
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
}
