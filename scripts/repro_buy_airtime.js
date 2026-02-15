
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function testBuyAirtime() {
    console.log(`\nTesting: Buy Airtime (POST check)...`);

    // MTN Airtime
    const payload = {
        service_id: "ABA", // MTN
        requestType: "PREMIUM", // Using known working type
        phoneNumber: "08031234567",
        amount: 50,
        trans_id: "TST" + Date.now().toString().slice(-8) + "A"
    };

    try {
        console.log("Payload:", JSON.stringify(payload));
        const response = await axios.post(`${baseURL}/services/`, payload, {
            headers: { "Authorization": `Bearer ${secretKey}` },
            timeout: 20000 // 20s timeout
        });
        console.log("Response:", JSON.stringify(response.data));
    } catch (error) {
        console.log("Error:", error.response?.data || error.message);
    }
}

testBuyAirtime();
