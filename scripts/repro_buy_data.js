
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function testBuyData(useRequestType) {
    console.log(`\nTesting buyData with ${useRequestType ? 'requestType' : 'service_type'}...`);

    // MTN 1GB SME settings
    const serviceId = "BCA"; // MTN
    const planCode = "1000"; // 1GB
    const amount = 1000; // Nominal amount
    const phone = "08123456789";
    const transId = "TST" + Date.now().toString().slice(-8) + (useRequestType ? "R" : "S");

    const payload = {
        service_id: serviceId,
        beneficiary: phone,
        trans_id: transId,
        code: planCode,
        amount: amount,
    };

    if (useRequestType) {
        payload.requestType = "SME";
    } else {
        payload.service_type = "SME";
    }

    try {
        console.log("Payload:", JSON.stringify(payload, null, 2));
        const response = await axios.post(`${baseURL}/services/`, payload, {
            headers: { "Authorization": `Bearer ${secretKey}` }
        });
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log("Error:", error.response?.data || error.message);
    }
}

async function run() {
    await testBuyData(false); // Test current implementation (service_type)
    await testBuyData(true);  // Test proposed fix (requestType)
}

run();
