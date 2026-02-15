
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

async function probeTransaction(serviceId, requestType) {
    const url = "https://enterprise.mobilenig.com/api/v2/services/";
    console.log(`Probing ${serviceId} (${requestType})...`);

    try {
        const response = await axios.post(url, {
            service_id: serviceId,
            requestType: requestType,
            phoneNumber: "08012345678",
            amount: 1,
            trans_id: "PRB-" + Date.now()
        }, {
            headers: {
                "Authorization": `Bearer ${secretKey}`,
                "Content-Type": "application/json"
            },
            timeout: 30000 // 30s timeout
        });
        console.log(`✅ ID ${serviceId}: SUCCESS/ACCEPTED (Status ${response.status}) - ${JSON.stringify(response.data)}`);
    } catch (error) {
        let msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.log(`❌ ID ${serviceId}: ${msg}`);
    }
}

async function run() {
    // Candidates for MTN Airtime
    await probeTransaction("MTN", "PREMIUM");
    await probeTransaction("MTN", "VTU");

    // Check if ABA is reusable
    await probeTransaction("ABA", "VTU");

    // Check numeric
    await probeTransaction("1", "PREMIUM");

    // Check BCA reuse
    await probeTransaction("BCA", "PREMIUM");

    // Check codes from documentation if found (search result mentioned "MTN")
    // "MTN":"MTN|9" -> maybe service_id is "MTN"?
}

run();
