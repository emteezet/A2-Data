
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function fetchAllServices() {
    console.log("Fetching Available Services...");

    // Some APIs allow service_id=ALL to get everything
    // Others might requires individual probes
    const serviceGroups = ["ABA", "ABB", "ABC", "ABD", "MTN", "GLO", "AIRTEL", "9MOBILE", "BCA", "BCB", "BCC", "BCD"];

    for (const id of serviceGroups) {
        try {
            const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}&requestType=PREMIUM`;
            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 5000
            });

            if (response.data) {
                console.log(`\nID: ${id}`);
                console.log("Data:", JSON.stringify(response.data, null, 2));
            }
        } catch (error) {
            // console.log(`ID ${id} failed: ${error.response?.status}`);
        }
    }
}

fetchAllServices();
