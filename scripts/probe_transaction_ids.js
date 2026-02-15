
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

async function probeTransaction(serviceId) {
    const url = "https://enterprise.mobilenig.com/api/v2/services/";
    // console.log(`\nProbing Service ID: ${serviceId}`);

    try {
        const response = await axios.post(url, {
            service_id: serviceId,
            requestType: "PREMIUM", // Try PREMIUM first
            phoneNumber: "08012345678",
            amount: 1, // Tiny amount
            trans_id: "PRB-" + Date.now()
        }, {
            headers: {
                "Authorization": `Bearer ${secretKey}`,
                "Content-Type": "application/json"
            },
            timeout: 5000
        });
        console.log(`✅ ID ${serviceId}: SUCCESS/ACCEPTED (Status ${response.status}) - ${JSON.stringify(response.data)}`);
    } catch (error) {
        let data = error.response?.data;
        let msg = (typeof data === 'object') ? JSON.stringify(data) : data;
        // Log interesting errors, filter out "Invalid API Key" (shouldn't happen with Live Key and Slash)
        console.log(`❌ ID ${serviceId}: ${msg}`);
    }
}

async function run() {
    const ids = [
        "MTN", "GLO", "AIRTEL", "9MOBILE", "ETISALAT",
        "ABA", "ABB", "ABC", "ABD",
        "1", "2", "3", "4",
        "ORI", "AIR", "MT", "GL", "9M"
    ];

    console.log("Starting Transaction Probe...");
    for (const id of ids) {
        await probeTransaction(id);
    }
}

run();
