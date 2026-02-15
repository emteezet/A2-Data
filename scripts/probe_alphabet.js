
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function probe() {
    console.log("Probing AA.. to AZ..");

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Create all 2-letter combos
    let twoLetter = [];
    for (let i = 0; i < chars.length; i++) {
        for (let j = 0; j < chars.length; j++) {
            twoLetter.push(chars[i] + chars[j]);
        }
    }

    // Prefixes to try. "A" for Airtime? "M" for MTN? "G" for Glo?
    const prefixes = ["A", "B", "M", "G", "E", "9", "0", "1"];

    // We'll process in chunks to avoid rate limits but stay fast
    const chunkSize = 20;

    for (const prefix of prefixes) {
        console.log(`Scanning usage for prefix ${prefix}...`);

        for (let i = 0; i < twoLetter.length; i += chunkSize) {
            const chunk = twoLetter.slice(i, i + chunkSize);
            const promises = chunk.map(suffix => {
                const id = prefix + suffix;
                const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}`;
                return axios.get(url, {
                    headers: { "Authorization": `Bearer ${publicKey}` },
                    timeout: 3000
                }).then(res => {
                    if (res.status === 200 && res.data.details) {
                        return `FOUND ${id}: ${res.data.details.name} (${res.data.details.status})`;
                    }
                    return null;
                }).catch(err => null);
            });

            const results = await Promise.all(promises);
            results.filter(r => r).forEach(r => console.log(r));
        }
    }
}

probe();
