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
  const cobaltApis = [
    'https://api.cobalt.liubquanti.click',
    'https://subito-c.meowing.de',
    'https://api.qwkuns.me'
  ];

  // 1. Try public Cobalt instances first (no datacenter IP block, very light on Render RAM)
  for (const api of cobaltApis) {
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
          isAudioOnly: true,
          audioFormat: 'mp3'
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        if (data.url) {
          console.log(`[Audio Stream] Cobalt success (${api}). Redirecting to: ${data.url.substring(0, 80)}...`);
          res.redirect(data.url);
          return;
        }
      }
    } catch (err: any) {
      console.warn(`[Audio Stream] Cobalt ${api} failed: ${err.message}`);
    }
  }

  // 2. Fallback to local youtube-dl-exec extraction (useful if running backend locally via ngrok/localtunnel)
  try {
    console.log(`[Audio Stream] Cobalt failed. Falling back to local yt-dlp extraction...`);
    const info = await youtubeDl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      extractorArgs: 'youtube:player_client=android',
      format: 'bestaudio/best',
    } as any);

    const directUrl = (info as any).url || (info as any).requested_downloads?.[0]?.url;
    if (directUrl) {
      console.log(`[Audio Stream] yt-dlp success. Redirecting to direct URL.`);
      res.redirect(directUrl);
      return;
    }
  } catch (err: any) {
    console.error(`[Audio Stream] yt-dlp fallback failed: ${err.message}`);
  }

  if (!res.headersSent) {
    res.status(500).json({ error: "Internal Server Error", message: "Failed to extract streaming URL from all sources." });
  }
};
