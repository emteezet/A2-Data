import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2/";

async function testFetchPlans() {
    const services = [
        { id: "BCA", name: "MTN SME" },
        { id: "BCD", name: "Airtel SME" },
        { id: "BCC", name: "Glo" },
        { id: "BCB", name: "9mobile SME" }
    ];

    for (const service of services) {
        console.log(`\nTesting ${service.name} (POST /services/packages)...`);
        try {
            const response = await axios.post(`${baseURL}services/packages`, {
                service_id: service.id,
                requestType: "SME"
            }, {
                headers: { "Authorization": `Bearer ${publicKey}` }
            });
            console.log(`${service.name} Result:`, response.data.message || response.data.status || "Success");
        } catch (error) {
            console.log(`${service.name} Error:`, error.response?.data || error.message);
        }
    }
}

testFetchPlans();
