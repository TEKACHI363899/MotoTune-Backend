import { Request, Response } from 'express';
import { SpotifyService } from '../services/spotify.service';
import youtubeDl from 'youtube-dl-exec';

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

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    console.log(`[Audio Stream] Resolving stream for videoId: ${videoId}`);
    
    // 1. Fetch current working cobalt instances from the directory
    const dirRes = await fetch('https://cobalt.directory/api/working?type=api');
    if (!dirRes.ok) {
      throw new Error(`Failed to fetch cobalt directory, status: ${dirRes.status}`);
    }
    
    const dirData = (await dirRes.json()) as any;
    const apis: string[] = dirData.data?.youtube || [];
    
    if (apis.length === 0) {
      throw new Error("No active YouTube cobalt instances found in directory");
    }

    // 2. Iterate and find a working public instance
    for (const api of apis) {
      try {
        console.log(`[Audio Stream] Attempting Cobalt API: ${api}`);
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: videoUrl,
            downloadMode: 'audio',
            audioFormat: 'mp3'
          }),
          signal: AbortSignal.timeout(6000) // Timeout after 6 seconds to avoid hanging
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          if (data.url) {
            console.log(`[Audio Stream] Redirection successful. Direct URL: ${data.url.substring(0, 80)}...`);
            res.redirect(data.url);
            return;
          }
        } else {
          console.warn(`[Audio Stream] API ${api} returned status: ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`[Audio Stream] API ${api} failed: ${err.message}`);
      }
    }

    throw new Error("All active Cobalt instances failed to extract direct URL");

  } catch (error: any) {
    console.error("[Audio Stream] Failover Exception:", error.message || error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error", message: error.message || "Failed to extract audio URL" });
    }
  }
};
