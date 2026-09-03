const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { sub: "0a035e08-ddcc-4186-aaa0-8b97eba4927b", email: "zaefrali90@gmail.com", role: "admin" },
  "super_secret_key_123",
  { expiresIn: '7d' }
);

console.log("Generated test token:", token);

async function testCart() {
  const baseUrl = "https://policies-strategic-rotation-extends.trycloudflare.com";
  
  console.log("\n1. Adding item to cart via Cloudflare tunnel...");
  const addRes = await fetch(`${baseUrl}/api/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      productId: "1",
      name_ar: "IPhone 13 ProMax",
      price: 4000,
      quantity: 1
    })
  });
  console.log("Add Status:", addRes.status);
  const addData = await addRes.json().catch(() => ({}));
  console.log("Add Response:", addData);

  console.log("\n2. Getting cart via Cloudflare tunnel...");
  const getRes = await fetch(`${baseUrl}/api/cart`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  console.log("Get Status:", getRes.status);
  const getData = await getRes.json().catch(() => ({}));
  console.log("Get Response:", getData);
}

testCart();
