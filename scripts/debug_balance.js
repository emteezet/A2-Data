
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function checkBalance() {
    const url = "https://enterprise.mobilenig.com/api/v2/control/balance";
    console.log(`Testing Balance Endpoint: ${url}`);
    console.log(`Using Public Key: ${publicKey.substring(0, 10)}...`);

    try {
        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${publicKey}`,
                "Content-Type": "application/json"
            },
            timeout: 10000
        });
        console.log("✅ BALANCE SUCCEEDED:", response.status, response.data);
    } catch (error) {
        console.log("❌ BALANCE FAILED:", error.response?.status, error.response?.data || error.message);
    }
}

checkBalance();
