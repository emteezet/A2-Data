
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function probe() {
    console.log("Probing potential endpoints...");

    // List of endpoints to try
    const endpoints = [
        "/services/packages",
        "/services/plans",
        "/services/data_plans",
        "/control/services",
        "/control/packages",
        "/control/data_bundles",
        "/misc/data_plans"
    ];

    for (const ep of endpoints) {
        try {
            const url = `${baseURL}${ep}`;
            // console.log(`Trying ${url}...`);
            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 5000,
                validateStatus: () => true // Don't throw on error status
            });

            console.log(`[${response.status}] ${ep}`);
            if (response.status === 200) {
                console.log("Response preview:", JSON.stringify(response.data).slice(0, 200));
            }
        } catch (error) {
            console.log(`[ERR] ${ep}: ${error.message}`);
        }
    }
}

probe();
