
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function fetch() {
    console.log("Fetching Services with Trailing Slash...");
    const urls = [
        "https://enterprise.mobilenig.com/api/v2/services/",
        "https://enterprise.mobilenig.com/api/v2/services",
        "https://enterprise.mobilenig.com/api/v2/control/services/",
        "https://enterprise.mobilenig.com/api/v2/control/services"
    ];

    for (const url of urls) {
        try {
            console.log(`\nGET ${url}`);
            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 5000
            });
            console.log("✅ SUCCESS:", response.status);
            // Log structure
            console.log(JSON.stringify(response.data).substring(0, 500));
        } catch (error) {
            console.log("❌ FAILED:", error.response?.status, error.message);
        }
    }
}

fetch();
