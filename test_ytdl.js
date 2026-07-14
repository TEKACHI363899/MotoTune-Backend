const ytdl = require('@distube/ytdl-core');
async function test() {
    try {
        console.log("Fetching info...");
        const info = await ytdl.getInfo('https://www.youtube.com/watch?v=FvOpPeKSf_4');
        console.log("Title:", info.videoDetails.title);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        console.log("Audio URL:", format.url);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
