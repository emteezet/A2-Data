
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

async function testPayload(name, payload, key) {
    console.log(`\nTesting Payload: ${name}`);
    try {
        const response = await axios.post("https://enterprise.mobilenig.com/api/v2/services", payload, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            timeout: 10000
        });
        console.log("✅ SUCCESS:", response.status, response.data);
    } catch (error) {
        console.log("❌ FAILED:", error.response?.status, JSON.stringify(error.response?.data || error.message));
    }
}

async function run() {
    // 1. Standard Airtime Payload (from dataProvider)
    await testPayload("Airtime Standard", {
        service_id: "ABA",
        requestType: "PREMIUM",
        phoneNumber: "08012345678",
        amount: 100,
        trans_id: "TEST-AIR-" + Date.now()
    }, publicKey);

    // 2. Airtime Payload with 'TEST' requestType
    await testPayload("Airtime TEST Type", {
        service_id: "ABA",
        requestType: "TEST",
        phoneNumber: "08012345678",
        amount: 100,
        trans_id: "TEST-AIR-" + Date.now()
    }, publicKey);

    // 3. Data Payload
    await testPayload("Data SME", {
        service_id: "BCA",
        service_type: "SME",
        beneficiary: "08012345678",
        amount: "500", // Plan code
        trans_id: "TEST-DATA-" + Date.now()
    }, publicKey);

    // 4. Try with Secret Key just in case
    await testPayload("Airtime (Secret Key)", {
        service_id: "ABA",
        requestType: "PREMIUM",
        phoneNumber: "08012345678",
        amount: 100,
        trans_id: "TEST-SEC-" + Date.now()
    }, secretKey);
}

run();
