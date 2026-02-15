
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

async function testRequestTypes() {
    console.log("Testing Request Types for Service IDs...");

    const configs = [
        { id: "ABA", type: "PREMIUM" },
        { id: "ABA", type: "VTU" },
        { id: "ABA", type: "STANDARD" },
        { id: "MTN", type: "PREMIUM" },
        { id: "MTN", type: "VTU" },
        { id: "MTN", type: "STANDARD" },
    ];

    for (const conf of configs) {
        console.log(`\nTesting ID: ${conf.id}, Type: ${conf.type}`);
        try {
            const response = await axios.post("https://enterprise.mobilenig.com/api/v2/services/", {
                service_id: conf.id,
                requestType: conf.type,
                phoneNumber: "08012345678",
                amount: 100, // Small amount
                trans_id: "REQTEST-" + Date.now()
            }, {
                headers: { "Authorization": `Bearer ${secretKey}` },
                timeout: 5000
            });
            console.log(`✅ RESULT:`, JSON.stringify(response.data));
        } catch (error) {
            console.log(`❌ FAILED:`, error.response?.status, error.response?.data?.details || error.response?.data?.message || error.message);
        }
    }
}

testRequestTypes();
