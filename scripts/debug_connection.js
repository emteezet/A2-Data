
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY;
const secretKey = process.env.MOBILENIG_SECRET_KEY;

console.log("Loading keys from .env.local...");
console.log("Public Key Prefix:", publicKey ? publicKey.substring(0, 10) : "UNDEFINED");
console.log("Secret Key Prefix:", secretKey ? secretKey.substring(0, 10) : "UNDEFINED");

async function checkBalance() {
    console.log("\n--- Checking Balance (GET /balance) ---");
    try {
        const response = await axios.get("https://enterprise.mobilenig.com/api/v2/balance", {
            headers: {
                "Authorization": `Bearer ${publicKey}`,
                "Content-Type": "application/json"
            },
            timeout: 30000 // 30 seconds
        });
        console.log("✅ Balance Status:", response.status);
        console.log("✅ Balance Data:", response.data);
    } catch (error) {
        console.log("❌ Balance Failed:", error.response?.status || error.code);
        console.log("❌ Error Details:", error.response?.data || error.message);
    }
}

async function checkUser() {
    console.log("\n--- Checking User (POST /services w/ minimal payload) ---");
    // Some APIs use POST /services for everything
    try {
        const response = await axios.post("https://enterprise.mobilenig.com/api/v2/services", {
            service_id: "ABA",
            requestType: "PREMIUM",
            phoneNumber: "08012345678",
            amount: 100,
            trans_id: "CHK-" + Date.now()
        }, {
            headers: {
                "Authorization": `Bearer ${publicKey}`,
                "Content-Type": "application/json"
            },
            timeout: 30000
        });
        console.log("✅ Service Status:", response.status);
        console.log("✅ Service Data:", response.data);
    } catch (error) {
        console.log("❌ Service Failed:", error.response?.status || error.code);
        console.log("❌ Error Details:", error.response?.data || error.message);
    }
}

async function run() {
    await checkBalance();
    await checkUser();
}

run();
