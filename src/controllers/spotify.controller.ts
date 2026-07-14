import { Request, Response } from 'express';
import { SpotifyService } from '../services/spotify.service';
import ytdl from '@distube/ytdl-core';

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
    const isValid = ytdl.validateURL(url);
    if (!isValid) {
      res.status(400).json({ error: "Invalid YouTube URL." });
      return;
    }

    res.header('Content-Type', 'audio/mpeg');
    ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio'
    }).pipe(res);
  } catch (error: any) {
    console.error("[Audio Stream] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  }
};
