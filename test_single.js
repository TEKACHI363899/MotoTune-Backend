async function test() {
  const api = 'https://api.vve.wtf';
  const videoUrl = 'https://www.youtube.com/watch?v=FvOpPeKSf_4';
  try {
    const response = await fetch(api, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: videoUrl,
        downloadMode: 'audio',
        isAudioOnly: true
      })
    });
    console.log("Status:", response.status);
    const body = await response.text();
    console.log("Body:", body.substring(0, 300));
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
