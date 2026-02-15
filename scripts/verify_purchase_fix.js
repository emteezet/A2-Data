
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

async function verifyFix() {
    const url = "https://enterprise.mobilenig.com/api/v2/services/"; // TRAILING SLASH
    console.log(`Verifying Fix: ${url} with Secret Key`);

    try {
        const response = await axios.post(url, {
            service_id: "ABA",
            requestType: "PREMIUM",
            phoneNumber: "08012345678",
            amount: 100,
            trans_id: "TEST-FIX-" + Date.now()
        }, {
            headers: {
                "Authorization": `Bearer ${secretKey}`, // SECRET KEY
                "Content-Type": "application/json"
            },
            timeout: 10000
        });
        console.log("✅ SUCCESS:", response.status, response.data);
    } catch (error) {
        let status = error.response?.status || error.code;
        let data = error.response?.data || error.message;
        if (typeof data === 'object') data = JSON.stringify(data);
        console.log(`❌ FAILED: ${status} - ${data}`);
    }
}

verifyFix();
