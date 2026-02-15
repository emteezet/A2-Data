
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function probe() {
    console.log("Probing Single Carbon IDs (A, B, C, D)...");
    const ids = ["A", "B", "C", "D"];
    const types = ["PREMIUM", "VTU", "STANDARD"];

    for (const id of ids) {
        for (const type of types) {
            try {
                const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}&requestType=${type}`;
                const response = await axios.get(url, {
                    headers: { "Authorization": `Bearer ${publicKey}` },
                    timeout: 5000
                });

                if (response.data && (response.data.status === "available" || response.data.statusCode === "200")) {
                    console.log(`\n✅ FOUND WORKING ID: ${id}, Type: ${type}`);
                    console.log("Data:", JSON.stringify(response.data, null, 2));
                } else {
                    // console.log(`ID ${id}, Type ${type}: ${response.data.status}`);
                }
            } catch (error) {
                // console.log(`ID ${id}, Type ${type} Failed: ${error.response?.status}`);
            }
        }
    }
}

probe();
