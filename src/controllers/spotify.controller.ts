import { Request, Response } from 'express';
import { SpotifyService } from '../services/spotify.service';
import { exec } from 'youtube-dl-exec';

const spotifyService = new SpotifyService();

export const searchTracks = async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;

  if (!query || query.trim() === '') {
    res.status(400).json({ error: "Missing 'q' query parameter for search keyword." });
    return;
  }

  try {
    const results = await spotifyService.searchTracks(query);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Failed to query Spotify catalog."
    });
  }
};

export const streamTrack = async (req: Request, res: Response): Promise<void> => {
  const videoId = req.params.videoId;
  if (!videoId) {
    res.status(400).json({ error: "Missing videoId parameter." });
    return;
  }

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    // expo-av accepts m4a or mp3 streams well
    res.header('Content-Type', 'audio/mp4');
    res.header('Transfer-Encoding', 'chunked');
    
    const subprocess = exec(url, {
      format: 'bestaudio/best',
      output: '-',
      noWarnings: true,
      extractorArgs: 'youtube:player_client=android',
    } as any);
    
    if (subprocess.stdout) {
      subprocess.stdout.pipe(res);
    } else {
      throw new Error("Failed to initialize audio stream pipeline (stdout is null)");
    }

    if (subprocess.stderr) {
      subprocess.stderr.on('data', (data: Buffer) => {
        console.error(`[Audio Stream] yt-dlp stderr: ${data.toString()}`);
      });
    }
    
    subprocess.on('error', (err) => {
      console.error("[Audio Stream] Process error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error", message: err.message });
      }
    });

    subprocess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[Audio Stream] yt-dlp exited with code ${code}`);
        if (!res.headersSent) {
          res.status(500).json({ error: "Stream failed", message: `yt-dlp exited with code ${code}` });
        }
      }
    });

  } catch (error: any) {
    console.error("[Audio Stream] Exception:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  }
};
