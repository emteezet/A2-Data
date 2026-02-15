
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function fetchServices() {
    console.log("Fetching Services List...");
    // Try different potential endpoints for listing services
    const endpoints = [
        "https://enterprise.mobilenig.com/api/v2/services", // GET might list services
        "https://enterprise.mobilenig.com/api/v2/control/services",
        "https://enterprise.mobilenig.com/api/v2/services/categories",
        "https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=ALL"
    ];

    for (const url of endpoints) {
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
            console.log("❌ FAILED:", error.response?.status, error.response?.data?.message || error.message);
        }
    }
}

fetchServices();
