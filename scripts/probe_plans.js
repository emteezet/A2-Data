
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function checkPlans() {
    const service_id = "BCA"; // MTN SME
    const service_type = "SME";

    console.log(`Checking plans for ${service_id} (${service_type})...`);

    try {
        const url = `https://enterprise.mobilenig.com/api/v2/control/services_prices?service_id=${service_id}&service_type=${service_type}`;
        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${publicKey}`,
                "Content-Type": "application/json"
            }
        });

        console.log("✅ SUCCESS");
        const details = response.data.details || response.data.data || [];
        console.log("Raw Details:", JSON.stringify(details, null, 2));

        if (Array.isArray(details)) {
            details.forEach(plan => {
                console.log(`Name: ${plan.name}, Code: ${plan.code || plan.product_code}, Price: ${plan.price}, Amount: ${plan.amount}`);
            });
        }
    } catch (error) {
        console.error("❌ FAILED:", error.response?.status, error.response?.data || error.message);
    }
}

checkPlans();
