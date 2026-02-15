
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function probeStatus() {
    console.log(`\nProbing services_status check (POST/Header)...`);

    // MTN SME (BCA)
    const url = `${baseURL}/control/services_status`;

    try {
        // Try 1: GET with Header
        console.log("Attempt 1: GET with Content-Type header");
        try {
            const res1 = await axios.get(url, {
                params: { service_id: "BCA", requestType: "SME" },
                headers: {
                    "Authorization": `Bearer ${publicKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 10000
            });
            console.log("Response 1:", JSON.stringify(res1.data, null, 2));
        } catch (e) { console.log("Amt 1 Error:", e.response?.data || e.message); }

        // Try 2: POST with Body
        console.log("\nAttempt 2: POST with JSON Body");
        try {
            const res2 = await axios.post(url, {
                service_id: "BCA",
                requestType: "SME"
            }, {
                headers: {
                    "Authorization": `Bearer ${publicKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 10000
            });
            console.log("Response 2:", JSON.stringify(res2.data, null, 2));
        } catch (e) { console.log("Amt 2 Error:", e.response?.data || e.message); }

    } catch (error) {
        console.log("Fatal Error:", error.message);
    }
}

probeStatus();
