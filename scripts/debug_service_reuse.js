
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

async function testReuse(serviceId, requestType) {
    console.log(`\nTesting ${serviceId} with ${requestType}...`);
    try {
        const response = await axios.post("https://enterprise.mobilenig.com/api/v2/services/", {
            service_id: serviceId,
            requestType: requestType,
            phoneNumber: "08012345678",
            amount: 1,
            trans_id: "REUSE-" + Date.now()
        }, {
            headers: { "Authorization": `Bearer ${secretKey}` }
        });
        console.log(`✅ SUCCESS: ${response.status} - ${JSON.stringify(response.data)}`);
    } catch (error) {
        let msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.log(`❌ FAILED: ${error.response?.status} - ${msg}`);
    }
}

async function run() {
    // Known Data ID
    await testReuse("BCA", "PREMIUM");
    await testReuse("BCA", "VTU");

    // Known "Carpaddy" ID - maybe it's actually MTN Airtime but named weirdly?
    // User said "Carpaddy is currently unavailable". 
    // Maybe it IS the right ID but the service is down?
    // But unlikely MTN Airtime is down for everyone.

    // Try other Airtime candidates
    await testReuse("MTN", "PREMIUM");
    await testReuse("MTN", "VTU");
    await testReuse("A", "PREMIUM");
}

run();
