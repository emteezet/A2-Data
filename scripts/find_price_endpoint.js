
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function testEndpoint(method, path, params = {}, data = {}) {
    const url = `https://enterprise.mobilenig.com/api/v2${path}`;
    console.log(`Testing ${method} ${url} ...`);
    try {
        const config = {
            headers: {
                "Authorization": `Bearer ${publicKey}`,
                "Content-Type": "application/json"
            },
            params,
            timeout: 10000
        };

        let res;
        if (method === "GET") {
            res = await axios.get(url, config);
        } else {
            res = await axios.post(url, data, config);
        }
        console.log(`✅ SUCCESS: ${res.status}`);
        console.log(JSON.stringify(res.data).substring(0, 500));
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${error.response?.status} - ${JSON.stringify(error.response?.data || error.message).substring(0, 200)}`);
        return false;
    }
}

async function run() {
    console.log("=== Finding Price Endpoint ===\n");

    const commonParams = { service_id: "BCA", service_type: "SME" };
    const commonData = { service_id: "BCA", service_type: "SME", requestType: "SME" };

    const variations = [
        { method: "GET", path: "/control/services_prices" },
        { method: "POST", path: "/control/services_prices" },
        { method: "GET", path: "/control/get_prices" },
        { method: "POST", path: "/control/get_prices" },
        { method: "GET", path: "/services/prices" },
        { method: "POST", path: "/services/prices" },
        { method: "GET", path: "/services/get_prices" },
        { method: "POST", path: "/services/get_prices" },
        { method: "GET", path: "/control/prices" },
        { method: "POST", path: "/control/prices" },
        { method: "GET", path: "/services?action=get_prices" },
    ];

    for (const v of variations) {
        await testEndpoint(v.method, v.path, commonParams, commonData);
    }
}

run();
