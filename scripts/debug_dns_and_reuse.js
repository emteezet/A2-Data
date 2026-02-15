
import axios from "axios";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

function resolveHost() {
    return new Promise((resolve, reject) => {
        dns.lookup("enterprise.mobilenig.com", (err, address, family) => {
            if (err) reject(err);
            else resolve(address);
        });
    });
}

async function probeTransaction(serviceId, requestType) {
    const url = "https://enterprise.mobilenig.com/api/v2/services/";
    // console.log(`Probing ${serviceId} (${requestType})...`);
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
            timeout: 15000
        });
        console.log(`✅ ID ${serviceId} (${requestType}): SUCCESS (Status ${response.status}) - ${JSON.stringify(response.data)}`);
    } catch (error) {
        let msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.log(`❌ ID ${serviceId} (${requestType}): ${msg}`);
    }
}

async function run() {
    console.log("Checking DNS...");
    try {
        const ip = await resolveHost();
        console.log(`DNS Resolved: ${ip}`);
    } catch (e) {
        console.log("DNS Failed:", e.message);
        return;
    }

    // Try BCA SME (Control)
    await probeTransaction("BCA", "SME");

    // Try ABA (Carpaddy?)
    await probeTransaction("ABA", "PREMIUM");

    // Try Candidates
    await probeTransaction("MTN", "VTU");
    await probeTransaction("MTN", "PREMIUM");

    // Try Numeric
    await probeTransaction("1", "PREMIUM");
}

run();
