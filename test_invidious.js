async function test() {
  const instances = [
    'https://yewtu.be',
    'https://invidious.projectsegfau.lt',
    'https://invidious.privacydev.net',
    'https://iv.ggtyler.dev',
    'https://invidious.lunar.icu',
    'https://inv.nadeko.net',
    'https://invidious.flokinet.to'
  ];

  const videoId = 'FvOpPeKSf_4';

  for (const instance of instances) {
    try {
      console.log(`Testing ${instance}...`);
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Success with ${instance}!`);
        if (data.adaptiveFormats && data.adaptiveFormats.length > 0) {
          const audioFormats = data.adaptiveFormats.filter(f => f.type.startsWith('audio/'));
          console.log(`Found ${audioFormats.length} audio formats.`);
          if (audioFormats.length > 0) {
            console.log(`First audio format URL: ${audioFormats[0].url.substring(0, 100)}...`);
            return;
          }
        } else {
          console.log(`No adaptive formats found.`);
        }
      } else {
        console.log(`Failed with status: ${res.status}`);
      }
    } catch (e) {
      console.log(`Error with ${instance}: ${e.message}`);
    }
  }
}

test();
