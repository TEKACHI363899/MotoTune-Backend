const youtubeDl = require('youtube-dl-exec');

async function test() {
    console.log("Fetching stream URL via yt-dlp...");
    try {
        const rawOutput = await youtubeDl('https://www.youtube.com/watch?v=FvOpPeKSf_4', {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        });
        const info = rawOutput;
        const audioFormat = info.formats?.find(f => f.vcodec === 'none' && f.acodec !== 'none');
        console.log("Audio URL:", audioFormat ? audioFormat.url : "Not found");
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
