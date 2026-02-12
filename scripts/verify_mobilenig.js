import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY;
const secretKey = process.env.MOBILENIG_SECRET_KEY;
const baseURL = process.env.DATA_PROVIDER_URL || "https://enterprise.mobilenig.com/api";

async function verifyConnection() {
    try {
        console.log("Testing MobileNig API Connection...");
        console.log(`Base URL: ${baseURL}`);

        const response = await axios.get(`${baseURL}/user`, {
            headers: {
                "Public-Key": publicKey,
                "Secret-Key": secretKey,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            console.log("Connection Successful!");
            console.log("User Data:", JSON.stringify(response.data, null, 2));
        } else {
            console.log(`Connection Failed with status ${response.status}`);
            console.log("Response:", response.data);
        }
    } catch (error) {
        console.error("Connection Error:", error.response?.data || error.message);
    }
}

verifyConnection();
