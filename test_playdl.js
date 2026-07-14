const play = require('play-dl');

async function test() {
    try {
        const url = 'https://www.youtube.com/watch?v=FvOpPeKSf_4';
        const stream = await play.stream(url);
        console.log("Stream Type:", stream.type);
        console.log("Stream URL:", stream.url);
        
        // Output the actual direct download URL!
        if (stream.url) {
            console.log("Success! Direct URL obtained.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
