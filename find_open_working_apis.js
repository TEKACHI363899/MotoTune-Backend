const fs = require('fs');

async function run() {
  const content = fs.readFileSync('C:\\Users\\Mobifone\\.gemini\\antigravity\\brain\\1e60c944-059f-43ca-b5ea-d95c91791742\\.system_generated\\steps\\1880\\content.md', 'utf8');
  // Extract JSON part from markdown file
  const jsonStr = content.substring(content.indexOf('{'));
  const parsed = JSON.parse(jsonStr);
  
  const openWorking = parsed.data.filter(item => {
    return item.online && !item.turnstile && 
           ((item.tests?.youtube?.status === true) || (item.tests?.['youtube-music']?.status === true));
  });
  
  console.log(`Found ${openWorking.length} open working APIs:`);
  openWorking.forEach(item => {
    console.log(`- API: ${item.api} (Score: ${item.score}, Frontend: ${item.frontend})`);
  });
}

run();
