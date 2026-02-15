
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2";

async function testFetchPlans(useRequestType) {
    const paramName = useRequestType ? "requestType" : "service_type";
    console.log(`\nTesting Fetch Plans with ${paramName}...`);

    // MTN SME (BCA)
    const serviceId = "BCA";
    const type = "SME";

    try {
        const url = `${baseURL}/control/services_prices`;
        const params = { service_id: serviceId };
        params[paramName] = type;

        console.log(`GET ${url}?service_id=${serviceId}&${paramName}=${type}`);

        const response = await axios.get(url, {
            params: params,
            headers: { "Authorization": `Bearer ${publicKey}` },
            timeout: 10000
        });

        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log("Error:", error.response?.data || error.message);
    }
}

async function run() {
    await testFetchPlans(false); // Test current implementation (service_type)
    await testFetchPlans(true);  // Test proposed fix (requestType)
}

run();
