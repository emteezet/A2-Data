
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function probe() {
    console.log("Final Probe for Price List...");

    const endpoints = [
        "/control/prices",
        "/services/prices",
        "/control/service_prices",
        "/control/data/prices",
        "/services/data/prices",
        "/prices",
        "/data/plans",
        "/control/data_plans"
    ];

    for (const ep of endpoints) {
        const url = `${baseURL}${ep}`;

        // Try GET
        try {
            const res = await axios.get(url, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 5000,
                validateStatus: null
            });
            if (res.status !== 404) console.log(`[GET] [${res.status}] ${ep}`);
        } catch (e) { }

        // Try POST
        try {
            const res = await axios.post(url, { timeout: 5000 }, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                validateStatus: null
            });
            if (res.status !== 404) console.log(`[POST] [${res.status}] ${ep}`);
        } catch (e) { }
    }
}

probe();
