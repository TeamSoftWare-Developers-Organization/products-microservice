const { chromium } = require('playwright');

(async () => {
    // Launch a clean incognito browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let hasErrors = false;

    // Listen to console logs and network errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error(`[Browser Console Error] ${msg.text()}`);
            hasErrors = true;
        } else {
            console.log(`[Browser Console] ${msg.text()}`);
        }
    });

    page.on('requestfailed', request => {
        console.error(`[Network Error] ${request.url()} failed: ${request.failure().errorText}`);
        hasErrors = true;
    });

    try {
        console.log("Navigating to http://microshop.local/auth/login...");
        await page.goto('http://microshop.local/auth/login', { waitUntil: 'networkidle' });

        console.log("Filling login form...");
        await page.fill('input[type="email"]', 'test@test.com');
        await page.fill('input[type="password"]', 'password123');

        console.log("Submitting login form...");
        // Start waiting for the network response before clicking
        const responsePromise = page.waitForResponse(response => response.url().includes('/auth/login') && response.request().method() === 'POST', { timeout: 10000 }).catch(() => null);

        await page.click('button[type="submit"]');

        const response = await responsePromise;
        if (response) {
            console.log(`[API Response] Status: ${response.status()}`);
            if (response.status() === 401) {
                console.log("[API Target Reached] Got 401 Unauthorized, meaning the request SUCCESSFULLY reached the backend without CORS issues.");
            }
        } else {
            console.log("[API Call] No response intercepted or it timed out.");
        }

        if (hasErrors) {
            console.log("Tests finished WITH errors.");
            process.exit(1);
        } else {
            console.log("Tests finished SUCCESSFULLY without console errors or network failures.");
        }

    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
