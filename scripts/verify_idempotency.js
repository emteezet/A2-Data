const axios = require('axios');

async function testIdempotency() {
    const baseURL = 'http://localhost:3000';
    const token = 'YOUR_TOKEN_HERE'; // User needs to provide this or I use a dummy for structure
    const idempotencyKey = `TEST-${Date.now()}`;

    console.log(`Testing idempotency with key: ${idempotencyKey}`);

    const payload = {
        action: "purchase",
        dataPlanId: "PLAN_ID",
        phoneNumber: "2348000000000",
        idempotencyKey
    };

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // Send two simultaneous requests
        const req1 = axios.post(`${baseURL}/api/data`, payload, { headers });
        const req2 = axios.post(`${baseURL}/api/data`, payload, { headers });

        const results = await Promise.allSettled([req1, req2]);

        results.forEach((res, index) => {
            if (res.status === 'fulfilled') {
                console.log(`Request ${index + 1} Success:`, res.value.data);
            } else {
                console.log(`Request ${index + 1} Failed:`, res.reason.response?.data || res.reason.message);
            }
        });
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Note: This script is a template. Real testing requires a running server and valid token.
console.log("Verification script created. Please run against a live local server.");
