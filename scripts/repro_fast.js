
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function testVariant(name, payloadOverrides) {
    console.log(`\nTesting: ${name}...`);

    // Base payload for MTN 1GB SME (Service Type)
    const basePayload = {
        service_id: "BCA",
        service_type: "SME",
        beneficiary: "08123456789",
        trans_id: "TST" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100),
        code: "1000",
        amount: 1000
    };

    const payload = { ...basePayload, ...payloadOverrides };

    // Remove keys if set to undefined
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
        console.log("Payload:", JSON.stringify(payload));
        const response = await axios.post(`${baseURL}/services/`, payload, {
            headers: { "Authorization": `Bearer ${secretKey}` },
            timeout: 5000 // Add timeout for faster feedback
        });
        console.log("Response:", JSON.stringify(response.data.message || response.data));
    } catch (error) {
        console.log("Error:", error.response?.data?.message || error.response?.data || error.message);
    }
}

async function run() {
    // 1. Without Code (Amount 1000)
    await testVariant("Without Code (Amount 1000)", { code: undefined });

    // 2. Amount = Price (250) with Code 1000
    await testVariant("Amount = Price (250)", { amount: 250 });
}

run();
