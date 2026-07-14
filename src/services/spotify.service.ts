import https from 'https';

export class SpotifyService {
  private requestHtml(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
          'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
        }
      };
      https.get(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve(body);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Search for tracks using YouTube.
   * Returns list of tracks where ID and URI are mapped to the YouTube Video ID.
   * This provides full-length songs for free without any API keys.
   * @param query Search query
   */
  async searchTracks(query: string): Promise<any[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      // sp=EgIQAQ%253D%253D filters for videos only
      const url = `https://www.youtube.com/results?search_query=${encodedQuery}&sp=EgIQAQ%253D%253D`;
      console.log("[Music Search] Scraping YouTube Search:", url);
      const html = await this.requestHtml(url);

      const regex = /var ytInitialData\s*=\s*({.+?});/;
      const match = html.match(regex);
      if (!match) {
        console.warn("Could not find ytInitialData in YouTube response.");
        return [];
      }

      const data = JSON.parse(match[1]);
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents
        || data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents
        || [];

      const tracks: any[] = [];
      for (const item of contents) {
        const video = item.videoRenderer;
        if (!video || !video.videoId) continue;

        const videoId = video.videoId;
        const title = video.title?.runs?.[0]?.text || "Unknown Title";
        const artist = video.ownerText?.runs?.[0]?.text || "Unknown Artist";
        const coverUrl = video.thumbnail?.thumbnails?.[0]?.url || 'https://res.cloudinary.com/dqgymln1n/image/upload/v1741094033/moto-video-placeholder_joxit9.png';
        
        tracks.push({
          id: videoId,
          title,
          artist,
          coverUrl,
          uri: videoId // Use videoId as the uri/address
        });

        if (tracks.length >= 25) break;
      }

      return tracks;
    } catch (error: any) {
      console.error("YouTube search scraping error:", error);
      throw error;
    }
  }
}
