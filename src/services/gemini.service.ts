import fs from 'fs';
import path from 'path';

export class GeminiService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not defined in backend .env');
    }
  }

  /**
   * Scan ODO text from base64 image
   */
  async scanOdo(base64Image: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            { text: "Bạn là một siêu máy quét OCR. Hãy trích xuất ra đúng dãy số tổng quãng đường (ODO). CHỈ TRẢ VỀ CÁC CON SỐ LIỀN NHAU (Ví dụ: 15200). Trả về 'NULL' nếu không thấy rõ." },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json() as any;
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini OCR API failed");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'NULL';
  }

  /**
   * Chat response with history and system prompt
   */
  async getChatResponse(
    messages: { role: string; parts: { text: string }[] }[],
    userMessage: string,
    systemPrompt: string
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [...messages, { role: "user", parts: [{ text: userMessage }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json() as any;
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini Chat API failed");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Diagnoses vehicle engine noise using uploaded video file path
   */
  async diagnoseVideo(videoPath: string, systemPrompt: string): Promise<string> {
    // 1. Upload video using raw bytes
    const stats = fs.statSync(videoPath);
    const videoStream = fs.readFileSync(videoPath);

    const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${this.apiKey}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'raw',
        'X-Goog-Upload-Header-Content-Type': 'video/mp4',
        'Content-Type': 'video/mp4',
        'Content-Length': stats.size.toString()
      },
      body: videoStream
    });

    const uploadData = await uploadRes.json() as any;
    if (!uploadRes.ok) {
      throw new Error(uploadData.error?.message || "Lỗi Upload Video lên Gemini Files");
    }

    const fileUri = uploadData.file.uri;
    const fileName = uploadData.file.name;

    // 2. Poll file state
    let fileState = uploadData.file.state;
    while (fileState === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const checkUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${this.apiKey}`;
      const checkRes = await fetch(checkUrl);
      const checkData = await checkRes.json() as any;
      fileState = checkData.state;
      
      if (fileState === 'FAILED') {
        throw new Error("Máy chủ Google không thể xử lý video tiếng máy này.");
      }
    }

    // 3. Generate diagnostic content
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{
        role: "user",
        parts: [
          { text: "Bác sĩ hãy lắng nghe đoạn video tiếng máy này và chẩn đoán giúp tôi nhé." },
          { fileData: { mimeType: "video/mp4", fileUri: fileUri } }
        ]
      }]
    };

    const genRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await genRes.json() as any;
    if (!genRes.ok) {
      throw new Error(data.error?.message || "Gemini Video Diagnosis API failed");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}
