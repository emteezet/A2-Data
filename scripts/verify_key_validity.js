
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();
const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();

async function testGetKey(keyType, key) {
    console.log(`\nTesting GET /control/services_status [${keyType} Key]`);
    try {
        const response = await axios.get("https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=ABA", {
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout: 10000
        });
        console.log("✅ GET SUCCESS:", response.status, response.data);
        return true;
    } catch (error) {
        console.log("❌ GET FAILED:", error.response?.status, error.response?.data || error.message);
        return false;
    }
}

async function testPostServices(keyType, key) {
    console.log(`\nTesting POST /services [${keyType} Key]`);
    try {
        // Try a very simple payload first
        const response = await axios.post("https://enterprise.mobilenig.com/api/v2/services", {
            service_id: "ABA",
            requestType: "PREMIUM",
            phoneNumber: "08012345678",
            amount: 100,
            trans_id: "TEST-" + Date.now()
        }, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout: 10000
        });
        console.log("✅ POST SUCCESS:", response.status, response.data);
    } catch (error) {
        console.log("❌ POST FAILED:", error.response?.status, error.response?.data || error.message);
    }
}

async function run() {
    console.log("Verifying Key Validity...");

    // Check Public Key
    const publicValid = await testGetKey("Public", publicKey);
    if (publicValid) {
        await testPostServices("Public", publicKey);
    }

    // Check Secret Key
    const secretValid = await testGetKey("Secret", secretKey);
    if (secretValid) {
        await testPostServices("Secret", secretKey);
    }
}

run();
