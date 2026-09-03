async function test() {
  const url = "https://policies-strategic-rotation-extends.trycloudflare.com/api/orders";
  console.log("Testing Order placement through Cloudflare Tunnel:", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: 1,
        quantity: 1,
        customerId: "test_customer"
      })
    });
    console.log("Order Status:", res.status);
    const data = await res.text();
    console.log("Order Response:", data);
  } catch (err) {
    console.error("Order Fetch Error:", err);
  }
}
test();
