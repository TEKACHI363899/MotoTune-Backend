const { exec } = require('youtube-dl-exec');
const fs = require('fs');

async function test() {
    console.log("Starting stream via yt-dlp...");
    const subprocess = exec('https://www.youtube.com/watch?v=FvOpPeKSf_4', {
        format: 'bestaudio/best',
        output: '-',
        noWarnings: true,
        callHome: false,
        extractorArgs: 'youtube:player_client=android',
    });
    
    subprocess.stdout.pipe(fs.createWriteStream('test_audio.mp3'));
    
    subprocess.on('close', () => {
        console.log("Stream finished!");
    });
}
test();
