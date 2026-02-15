
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY;
const secretKey = process.env.MOBILENIG_SECRET_KEY;

const configs = [
    {
        name: "V2 Base + Bearer Public",
        url: "https://enterprise.mobilenig.com/api/v2/services",
        headers: { "Authorization": `Bearer ${publicKey}` }
    },
    {
        name: "V2 Base + Bearer Secret",
        url: "https://enterprise.mobilenig.com/api/v2/services",
        headers: { "Authorization": `Bearer ${secretKey}` }
    },
    {
        name: "No-V2 Base + Bearer Public",
        url: "https://enterprise.mobilenig.com/api/services",
        headers: { "Authorization": `Bearer ${publicKey}` }
    },
    {
        name: "No-V2 Base + Bearer Secret",
        url: "https://enterprise.mobilenig.com/api/services",
        headers: { "Authorization": `Bearer ${secretKey}` }
    },
    {
        name: "No-V2 Base + Key Headers",
        url: "https://enterprise.mobilenig.com/api/services",
        headers: { "Public-Key": publicKey, "Secret-Key": secretKey }
    },
    {
        name: "V2 Base + Key Headers",
        url: "https://enterprise.mobilenig.com/api/v2/services",
        headers: { "Public-Key": publicKey, "Secret-Key": secretKey }
    },
    {
        name: "V2 Base + Basic Auth Secret",
        url: "https://enterprise.mobilenig.com/api/v2/services",
        headers: { "Authorization": `Basic ${Buffer.from(secretKey + ":").toString('base64')}` }
    },
    {
        name: "V2 Base + Basic Auth Public",
        url: "https://enterprise.mobilenig.com/api/v2/services",
        headers: { "Authorization": `Basic ${Buffer.from(publicKey + ":").toString('base64')}` }
    }
];

async function debug() {
    console.log("Starting Debug Probe...");

    for (const config of configs) {
        console.log(`\nTesting: ${config.name}`);
        console.log(`URL: ${config.url}`);
        try {
            // Try a simple POST that expects a response
            const response = await axios.post(config.url, {
                service_id: "ABA", // valid service_id from previous success
                requestType: "PREMIUM",
                phoneNumber: "08012345678",
                amount: 100,
                trans_id: "DBG-" + Date.now()
            }, {
                headers: { ...config.headers, "Content-Type": "application/json" },
                timeout: 5000
            });

            console.log("✅ STATUS:", response.status);
            console.log("✅ DATA:", JSON.stringify(response.data).substring(0, 200));
        } catch (error) {
            console.log("❌ STATUS:", error.response?.status || error.code);
            console.log("❌ ERROR:", JSON.stringify(error.response?.data || error.message).substring(0, 200));
        }
    }
}

debug();
