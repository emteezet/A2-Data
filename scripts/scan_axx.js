
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function scan() {
    console.log("Scanning 3-letter IDs (Axx)...");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            const id = "A" + alphabet[i] + alphabet[j];
            try {
                const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}&requestType=PREMIUM`;
                const response = await axios.get(url, {
                    headers: { "Authorization": `Bearer ${publicKey}` },
                    timeout: 2000
                });

                if (response.data && response.data.details) {
                    const name = response.data.details.name || "Unknown";
                    const status = response.data.details.status || "Unknown";
                    console.log(`FOUND ${id}: ${name} (${status})`);
                }
            } catch (error) {
                // Ignore
            }
        }
    }
}

scan();
