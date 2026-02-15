
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function testVariant(name, payloadOverrides) {
    console.log(`\nTesting: ${name}...`);

    // Base payload for MTN 1GB SME
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
            headers: { "Authorization": `Bearer ${secretKey}` }
        });
        console.log("Response:", JSON.stringify(response.data.message || response.data));
    } catch (error) {
        console.log("Error:", error.response?.data?.message || error.response?.data || error.message);
    }
}

async function run() {
    // 1. Send amount as string
    await testVariant("Amount as String", { amount: "1000" });

    // 2. Send Price (250) instead of Nominal
    await testVariant("Amount as Price", { amount: 250 });

    // 3. Send Price as String
    await testVariant("Price as String", { amount: "250" });

    // 4. Without Code
    await testVariant("Without Code", { code: undefined });

    // 5. Code as Number
    await testVariant("Code as Number", { code: 1000 });

    // 6. With RequestType instead of Service_Type (Double Check)
    await testVariant("With RequestType", { service_type: undefined, requestType: "SME" });
}

run();
