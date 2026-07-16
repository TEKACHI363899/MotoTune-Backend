async function test() {
  const apis = [
    'https://api.cobalt.liubquanti.click',
    'https://nuko-c.meowing.de',
    'https://grapefruit.clxxped.lol',
    'https://lime.clxxped.lol',
    'https://melon.clxxped.lol',
    'https://sunny.imput.net',
    'https://nachos.imput.net',
    'https://kityune.imput.net'
  ];

  const videoUrl = 'https://www.youtube.com/watch?v=FvOpPeKSf_4';

  for (const api of apis) {
    try {
      console.log(`Testing ${api}...`);
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl,
          downloadMode: 'audio',
          isAudioOnly: true,
          audioFormat: 'mp3'
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Success with ${api}! URL: ${data.url ? data.url.substring(0, 60) + '...' : 'none'}`);
      } else {
        console.log(`Failed with status: ${response.status}`);
        try {
          const body = await response.text();
          console.log(`Error body: ${body}`);
        } catch (_) {}
      }
    } catch (e) {
      console.log(`Error with ${api}: ${e.message}`);
    }
  }
}

test();
