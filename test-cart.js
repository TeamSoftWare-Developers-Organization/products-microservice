async function test() {
  const baseUrl = "https://policies-strategic-rotation-extends.trycloudflare.com";
  console.log("1. Logging in...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "zaefrali90@gmail.com", password: "password123" })
  });
  console.log("Login status:", loginRes.status);
  const loginData = await loginRes.json();
  const token = loginData.access_token || loginData.token;
  console.log("Token received:", !!token);

  if (!token) return;

  console.log("2. Adding product 1 to cart...");
  const addRes = await fetch(`${baseUrl}/api/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      productId: "1",
      name_ar: "IPhone 13 ProMax",
      price: 2500,
      quantity: 1
    })
  });
  console.log("Add to cart status:", addRes.status);
  const cartData = await addRes.json();
  console.log("Cart contents:", JSON.stringify(cartData, null, 2));

  console.log("3. Fetching cart...");
  const getRes = await fetch(`${baseUrl}/api/cart`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  console.log("Get cart status:", getRes.status);
  const fetchedCart = await getRes.json();
  console.log("Fetched cart contents:", JSON.stringify(fetchedCart, null, 2));
}

test();
