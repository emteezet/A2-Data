
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function fetchServices() {
    console.log("Fetching Services with 'requestType=PREMIUM'...");

    // Based on previous error, requestType is required for services_status
    // Try asking for status of ALL services
    // Or try guessing common service IDs like MTN, GLO if ALL fails

    const urls = [
        "https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=ALL&requestType=PREMIUM",
        "https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=MTN&requestType=PREMIUM",
        "https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=BCA&requestType=SME"
    ];

    for (const url of urls) {
        try {
            console.log(`\nTrying GET ${url}`);
            const response = await axios.get(url, {
                headers: {
                    "Authorization": `Bearer ${publicKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 5000
            });
            console.log("✅ SUCCESS:", response.status);
            console.log("DATA:", JSON.stringify(response.data).substring(0, 500));
        } catch (error) {
            console.log("❌ FAILED:", error.response?.status, JSON.stringify(error.response?.data || error.message));
        }
    }
}

fetchServices();
