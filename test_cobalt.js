async function test() {
  try {
    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: "https://www.youtube.com/watch?v=FvOpPeKSf_4",
        isAudioOnly: true
      })
    });
    const data = await response.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
