async function test() {
  const url = "https://policies-strategic-rotation-extends.trycloudflare.com/api/products";
  console.log("Testing Cloudflare Tunnel:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Products returned:", data.length);
    console.log("First product:", data[0]?.name_ar || data[0]?.name);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
test();
