async function test() {
  const api = 'https://api.cobalt.liubquanti.click';
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
        audioFormat: 'mp3'
      })
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", data);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
