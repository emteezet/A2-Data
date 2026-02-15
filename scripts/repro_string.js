
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function testStringAmount() {
    console.log(`\nTesting: Amount as String...`);

    // Base payload for MTN 1GB SME (Service Type)
    const payload = {
        service_id: "BCA",
        service_type: "SME",
        beneficiary: "08031234567",
        trans_id: "TST" + Date.now().toString().slice(-8) + "S",
        code: "1000",
        amount: "1000" // String!
    };

    try {
        console.log("Payload:", JSON.stringify(payload));
        console.log("Details: Amount type:", typeof payload.amount);

        const response = await axios.post(`${baseURL}/services/`, payload, {
            headers: { "Authorization": `Bearer ${secretKey}` },
            timeout: 20000 // 20s timeout
        });
        console.log("Response:", JSON.stringify(response.data));
    } catch (error) {
        console.log("Error:", error.response?.data || error.message);
    }
}

testStringAmount();
