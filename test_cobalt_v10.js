async function test() {
  const instances = [
    'https://subito-c.meowing.de',
    'https://api.qwkuns.me',
    'https://api-cobalt.eversiege.network',
    'https://cobalt.alpha.wolfy.love',
    'https://api.cobalt.liubquanti.click'
  ];

  const videoUrl = 'https://www.youtube.com/watch?v=FvOpPeKSf_4';

  for (const instance of instances) {
    try {
      console.log(`Testing ${instance}...`);
      const response = await fetch(instance, {
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

      if (response.ok) {
        const data = await response.json();
        console.log(`Success with ${instance}!`);
        console.log(data);
        if (data.url) {
          console.log(`Direct Audio URL: ${data.url.substring(0, 100)}...`);
          return;
        }
      } else {
        console.log(`Failed with status: ${response.status}`);
        try {
          const errText = await response.text();
          console.log(`Error body: ${errText}`);
        } catch (_) {}
      }
    } catch (e) {
      console.log(`Error with ${instance}: ${e.message}`);
    }
  }
}

test();
