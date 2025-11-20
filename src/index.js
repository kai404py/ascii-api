export default {
  async fetch(request) {
    const url = new URL(request.url);
    const num = url.searchParams.get("num") || "";
    const dest = url.searchParams.get("dest") || "";

    // Example placeholder — plug your actual ASCII build function here
    const ascii = buildAscii(num, dest);

    return new Response(JSON.stringify({ ascii }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// Replace with your real ASCII logic
function buildAscii(num, dest) {
  return `NUM: ${num}\nDEST: ${dest}`;
}
