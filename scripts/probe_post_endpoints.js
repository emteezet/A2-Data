
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function probe() {
    console.log("Probing POST endpoints...");

    // List of endpoints to try with POST
    const endpoints = [
        "/control/services_prices",
        "/control/services_status",
        "/services/packages"
    ];

    const body = {
        service_id: "BCA",
        requestType: "SME"
    };

    for (const ep of endpoints) {
        try {
            const url = `${baseURL}${ep}`;
            // console.log(`POST ${url}...`);
            const response = await axios.post(url, body, {
                headers: {
                    "Authorization": `Bearer ${publicKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 10000,
                validateStatus: null
            });

            console.log(`[${response.status}] ${ep}`);
            if (response.data) console.log(JSON.stringify(response.data).slice(0, 150));
        } catch (error) {
            console.log(`[ERR] ${ep}: ${error.message}`);
        }
    }
}

probe();
