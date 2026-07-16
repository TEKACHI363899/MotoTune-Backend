const youtubeDl = require('youtube-dl-exec');

async function test() {
    console.log("Extracting direct URL via yt-dlp...");
    try {
        const info = await youtubeDl('https://www.youtube.com/watch?v=FvOpPeKSf_4', {
            dumpSingleJson: true,
            noWarnings: true,
            extractorArgs: 'youtube:player_client=android',
            format: 'bestaudio/best',
        });
        
        const directUrl = info.url || info.requested_downloads?.[0]?.url;
        
        if (directUrl) {
            console.log("Direct URL found:", directUrl.substring(0, 100) + "...");
        } else {
            // Fallback: search formats array
            const formats = info.formats;
            if (formats) {
                const audioFormat = formats.find(f => f.vcodec === 'none' && f.acodec !== 'none' && f.url)
                    || formats.find(f => f.url);
                if (audioFormat) {
                    console.log(`Found format ${audioFormat.format_id}: ${audioFormat.url.substring(0, 100)}...`);
                } else {
                    console.log("No format with URL found!");
                }
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
