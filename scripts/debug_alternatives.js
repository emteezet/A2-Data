
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

console.log("Keys loaded:");
console.log("Public:", publicKey);
console.log("Secret:", secretKey);

const endpoints = [
    "https://enterprise.mobilenig.com/api/v2/services",
    "https://mobilenig.com/api/v2/services",
    "https://www.mobilenig.com/api/v2/services",
    "https://enterprise.mobilenig.com/api/services", // V1
];

// Helper to test a config
async function testConfig(url, keyType, key, userAgent = "Mozilla/5.0") {
    console.log(`\nTesting: ${url} [${keyType} Key] [UA: ${userAgent}]`);
    try {
        const response = await axios.post(url, {
            service_id: "ABA",
            requestType: "PREMIUM",
            phoneNumber: "08012345678",
            amount: 100,
            trans_id: "TEST-" + Date.now()
        }, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "User-Agent": userAgent,
                "Accept": "application/json"
            },
            timeout: 10000
        });
        console.log("✅ SUCCESS:", response.status, response.data);
    } catch (error) {
        const status = error.response?.status || error.code;
        const data = error.response?.data;
        const msg = (typeof data === 'object') ? JSON.stringify(data) : data?.substring(0, 100);
        console.log("❌ FAILED:", status, msg || error.message);
    }
}

async function run() {
    console.log("Starting Alternative Endpoint Probe...");

    // Test Public Key on all endpoints
    for (const url of endpoints) {
        await testConfig(url, "Public", publicKey);
    }

    // Test Secret Key on all endpoints
    for (const url of endpoints) {
        await testConfig(url, "Secret", secretKey);
    }

    // Checking 'Balance' which worked on V2 LIVE key previously? 
    // Actually services_status worked.
    console.log("\n--- Testing Reference Endpoint (services_status) ---");
    try {
        const response = await axios.get("https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=ABA", {
            headers: {
                "Authorization": `Bearer ${publicKey}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            timeout: 10000
        });
        console.log("✅ Services Status:", response.status, response.data);
    } catch (error) {
        console.log("❌ Services Status Failed:", error.response?.status, error.response?.data || error.message);
    }
}

run();
