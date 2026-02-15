
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function scanIDs() {
    console.log("Scanning Common Patterns with Multiple Request Types...");

    // Potential Service IDs
    const ids = ["ABA", "ABB", "ABC", "ABD", "MAE", "MAF", "MAG", "MAH"];
    // Potential Request Types
    const types = ["PREMIUM", "VTU", "SME", "GIFTING", "BILL", "DATA"];

    for (const id of ids) {
        for (const type of types) {
            const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}&requestType=${type}`;
            try {
                const response = await axios.get(url, {
                    headers: { "Authorization": `Bearer ${publicKey}` },
                    timeout: 1500
                });
                // Success 200 doesn't mean it exists, need to check blocked status or name
                if (response.status === 200 && response.data.details) {
                    console.log(`✅ FOUND: ID=${id} TYPE=${type} => ${JSON.stringify(response.data.details)}`);
                }
            } catch (e) {
                // 404/406 means invalid combo
            }
        }
    }
}

scanIDs();
