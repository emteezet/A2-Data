
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function probe() {
    console.log("Starting Robust Airtime Probe...");
    const ids = ["ABA", "ABB", "ABC", "ABD", "MTN", "GLO", "AIRTEL", "9MOBILE", "MTN_AIRTIME", "AIRTEL_AIRTIME"];

    for (const id of ids) {
        console.log(`\nTesting ID: ${id}`);
        try {
            // Try status endpoint
            const statusUrl = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}&requestType=PREMIUM`;
            const statusRes = await axios.get(statusUrl, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 5000
            });
            console.log(`Status Result for ${id}:`, JSON.stringify(statusRes.data.details || statusRes.data, null, 2));

            // Try prices endpoint
            const pricesUrl = `https://enterprise.mobilenig.com/api/v2/control/services_prices?service_id=${id}&service_type=PREMIUM`;
            const pricesRes = await axios.get(pricesUrl, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 5000
            });
            console.log(`Prices Result for ${id}:`, JSON.stringify(pricesRes.data.details || pricesRes.data, null, 2));

        } catch (error) {
            console.log(`ID ${id} FAILED:`, error.response?.status, error.response?.data?.message || error.message);
        }
    }
}

probe();
