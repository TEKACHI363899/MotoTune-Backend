async function test() {
  const instances = [
    'https://pipedapi.kavin.rocks',
    'https://piped-api.lunar.icu',
    'https://piped-api.privacydev.net',
    'https://api.piped.yt',
    'https://pipedapi.col1a.ru',
    'https://piped-api.us.projectsegfau.lt'
  ];

  const videoId = 'FvOpPeKSf_4';

  for (const instance of instances) {
    try {
      console.log(`Testing ${instance}...`);
      const res = await fetch(`${instance}/streams/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Success with ${instance}!`);
        if (data.audioStreams && data.audioStreams.length > 0) {
          console.log(`Found ${data.audioStreams.length} audio streams.`);
          console.log(`First audio stream URL: ${data.audioStreams[0].url.substring(0, 100)}...`);
          return;
        } else {
          console.log(`No audio streams found.`);
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
