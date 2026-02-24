

async function testLogin() {
    try {
        console.log("Sending POST to http://microshop.local/api/auth/login...");
        const response = await fetch("http://microshop.local/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Simulate browser sending origin
                "Origin": "http://microshop.local",
                "Referer": "http://microshop.local/auth/login"
            },
            body: JSON.stringify({
                email: "admin@microshop.com", // Assuming an admin exists or it will just fail auth
                password: "password"
            })
        });

        console.log("Status:", response.status);
        console.log("Headers:");
        response.headers.forEach((value, key) => {
            console.log(`  ${key}: ${value}`);
        });

        const text = await response.text();
        console.log("Body:", text.substring(0, 200));

    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testLogin();
