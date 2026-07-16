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

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Use yt-dlp to extract the direct audio URL (no binary piping through server)
    const info = await youtubeDl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      extractorArgs: 'youtube:player_client=android',
      format: 'bestaudio/best',
    } as any);

    // info is the parsed JSON with format details
    const directUrl = (info as any).url || (info as any).requested_downloads?.[0]?.url;
    
    if (!directUrl) {
      // Fallback: find a format with a URL in the formats array
      const formats = (info as any).formats;
      if (formats && formats.length > 0) {
        // Prefer audio-only, fallback to any with a URL
        const audioFormat = formats.find((f: any) => f.vcodec === 'none' && f.acodec !== 'none' && f.url)
          || formats.find((f: any) => f.url);
        if (audioFormat?.url) {
          console.log(`[Audio Stream] Redirecting to format ${audioFormat.format_id}: ${audioFormat.url.substring(0, 80)}...`);
          res.redirect(audioFormat.url);
          return;
        }
      }
      throw new Error("Could not extract audio URL from YouTube");
    }

    console.log(`[Audio Stream] Redirecting to: ${directUrl.substring(0, 80)}...`);
    res.redirect(directUrl);

  } catch (error: any) {
    console.error("[Audio Stream] Exception:", error.message || error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error", message: error.message || "Failed to extract audio URL" });
    }
  }
};
