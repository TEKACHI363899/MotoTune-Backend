async function test() {
  const videoId = 'FvOpPeKSf_4';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  try {
    console.log("Fetching working Cobalt APIs...");
    const dirRes = await fetch('https://cobalt.directory/api/working?type=api');
    if (!dirRes.ok) throw new Error("Failed to fetch cobalt directory");
    const dirData = await dirRes.json();
    const apis = dirData.data.youtube || [];
    console.log(`Found ${apis.length} YouTube API instances.`);
    
    for (const api of apis) {
      try {
        console.log(`Trying Cobalt instance: ${api}...`);
        const res = await fetch(api, {
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
        
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            console.log(`Success! Stream URL: ${data.url}`);
            return;
          }
        } else {
          console.log(`Failed with status: ${res.status}`);
        }
      } catch (e) {
        console.log(`Error with ${api}: ${e.message}`);
      }
    }
    console.log("No working Cobalt instance found.");
  } catch (err) {
    console.error("Failover test failed:", err.message);
  }
}

test();
