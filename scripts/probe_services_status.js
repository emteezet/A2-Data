
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function probeStatus() {
    console.log(`\nProbing services_status for BCA (30s timeout)...`);

    // MTN SME (BCA) - Try with requestType and service_type
    const url = `${baseURL}/control/services_status`;

    try {
        // Try 1: requestType
        console.log("Attempt 1: requestType=SME");
        const res1 = await axios.get(url, {
            params: { service_id: "BCA", requestType: "SME" },
            headers: { "Authorization": `Bearer ${publicKey}` },
            timeout: 30000
        });
        console.log("Response 1:", JSON.stringify(res1.data, null, 2));

        // Try 2: service_type
        console.log("\nAttempt 2: service_type=SME");
        const res2 = await axios.get(url, {
            params: { service_id: "BCA", service_type: "SME" },
            headers: { "Authorization": `Bearer ${publicKey}` },
            timeout: 30000
        });
        console.log("Response 2:", JSON.stringify(res2.data, null, 2));

    } catch (error) {
        console.log("Error:", error.response?.data || error.message);
    }
}

probeStatus();
