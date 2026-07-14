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
    
    const subprocess = exec(url, {
      format: 'bestaudio[ext=m4a]/bestaudio',
      output: '-',
      noWarnings: true,
      callHome: false,
      youtubeSkipDashManifest: true,
    } as any); // Cast to any to bypass strict Flags type check for obscure options
    
    if (subprocess.stdout) {
      subprocess.stdout.pipe(res);
    } else {
      throw new Error("Failed to initialize audio stream pipeline (stdout is null)");
    }
    
    subprocess.on('error', (err) => {
      console.error("[Audio Stream] Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error", message: err.message });
      }
    });

  } catch (error: any) {
    console.error("[Audio Stream] Exception:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  }
};
