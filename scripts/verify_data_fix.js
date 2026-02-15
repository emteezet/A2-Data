
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function verifyFix() {
    console.log(`\nVerifying Data Purchase Fix...`);

    // MTN 1GB SME
    // Corrected Payload: requestType instead of service_type, Amount as String
    const payload = {
        service_id: "BCA",
        requestType: "SME",
        beneficiary: "08031234567", // Valid MTN number
        trans_id: "TST" + Date.now().toString().slice(-10), // Ensure < 15 chars
        code: "1000",
        amount: "1000" // String!
    };

    try {
        console.log("Payload:", JSON.stringify(payload, null, 2));
        const response = await axios.post(`${baseURL}/services/`, payload, {
            headers: { "Authorization": `Bearer ${secretKey}` },
            timeout: 30000 // 30s timeout to be safe
        });
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log("Error:", error.response?.data || error.message);
    }
}

verifyFix();
