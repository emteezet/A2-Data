
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function scanIDs() {
    console.log("Scanning Service IDs (AAA-ZZZ)...");

    // Let's try to scan a range of IDs
    const prefixes = ["A", "B", "C", "D", "M", "G", "E", "9"];

    for (const p of prefixes) {
        for (let i = 65; i <= 90; i++) { // A-Z
            for (let j = 65; j <= 90; j++) { // A-Z
                const id = p + String.fromCharCode(i) + String.fromCharCode(j);
                const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}`;
                try {
                    const response = await axios.get(url, {
                        headers: { "Authorization": `Bearer ${publicKey}` },
                        timeout: 2000
                    });
                    if (response.data.details) {
                        console.log(`FOUND ${id}: ${JSON.stringify(response.data.details)}`);
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
    }
}

// Just try a smaller set for speed first: A.. to B..
async function smartScan() {
    console.log("Smart Scanning Common Patterns...");
    const ids = [
        // Known Data IDs
        "BCA", "BCB", "BCC", "BCD",
        // Potential Airtime IDs (maybe starting with A?)
        "ACA", "ACB", "ACC", "ACD",
        "ADA", "ADB", "ADC", "ADD",
        "AMA", "AMB", "AMC", "AMD",
        // Maybe just network names?
        "MTN", "GLO", "AIRTEL", "ETISALAT", "9MOBILE",
        // Maybe numeric?
        "1", "2", "3", "4"
    ];

    for (const id of ids) {
        try {
            const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}&requestType=PREMIUM`;
            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 3000
            });
            console.log(`ID ${id}: ${JSON.stringify(response.data)}`);
        } catch (e) {
            console.log(`ID ${id}: Failed ${e.response?.status}`);
        }
    }
}

smartScan();
