async function test() {
  const videoId = 'FvOpPeKSf_4';
  try {
    console.log("Fetching healthy Invidious instances...");
    const response = await fetch('https://api.invidious.io/instances.json?sort_by=health');
    if (!response.ok) throw new Error("Failed to fetch instances list");
    const list = await response.json();
    
    // Extract URIs of HTTPS instances that have API enabled
    const instances = list
      .filter(item => item[1].type === 'https' && item[1].monitor?.uptime > 95)
      .map(item => item[1].uri);
      
    console.log(`Found ${instances.length} healthy HTTPS instances. Testing video API...`);
    
    for (const uri of instances) {
      try {
        console.log(`Testing Invidious API: ${uri}...`);
        const res = await fetch(`${uri}/api/v1/videos/${videoId}`, {
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.adaptiveFormats && data.adaptiveFormats.length > 0) {
            const audioFormats = data.adaptiveFormats.filter(f => f.type.startsWith('audio/'));
            if (audioFormats.length > 0) {
              console.log(`SUCCESS! Working instance: ${uri}`);
              console.log(`Audio stream URL: ${audioFormats[0].url.substring(0, 100)}...`);
              // Test if the URL actually returns a stream (not 403)
              const streamCheck = await fetch(audioFormats[0].url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
              console.log(`Stream HEAD check status: ${streamCheck.status}`);
              if (streamCheck.ok) {
                console.log(`VERIFIED working stream on ${uri}!`);
                return;
              }
            }
          }
        } else {
          console.log(`Failed with status: ${res.status}`);
        }
      } catch (err) {
        console.log(`Error on ${uri}: ${err.message}`);
      }
    }
    console.log("No working Invidious instances found.");
  } catch (e) {
    console.error("Invidious test failed:", e.message);
  }
}

test();
