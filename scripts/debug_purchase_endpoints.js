
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

const variations = [
    "https://enterprise.mobilenig.com/api/v2/services",
    "https://enterprise.mobilenig.com/api/v2/services/", // Trailing slash
    "https://enterprise.mobilenig.com/api/v2/control/services",
    "https://enterprise.mobilenig.com/api/v2/control/services/",
    "https://enterprise.mobilenig.com/api/services", // v1?
    "https://mobilenig.com/api/v2/services",
];

async function testEndpoint(url) {
    console.log(`\nTesting: ${url}`);
    try {
        const response = await axios.post(url, {
            service_id: "ABA",
            requestType: "PREMIUM",
            phoneNumber: "08012345678",
            amount: 100,
            trans_id: "TEST-PROBE-" + Date.now()
        }, {
            headers: {
                "Authorization": `Bearer ${publicKey}`,
                "Content-Type": "application/json"
            },
            timeout: 10000
        });
        console.log("✅ SUCCESS:", response.status, response.data);
    } catch (error) {
        let status = error.response?.status || error.code;
        let data = error.response?.data || error.message;
        // Simplify output
        if (typeof data === 'object') data = JSON.stringify(data);
        console.log(`❌ FAILED: ${status} - ${data}`);
    }
}

async function run() {
    console.log("Starting Purchase Endpoint Probe...");
    for (const url of variations) {
        await testEndpoint(url);
    }
}

run();
