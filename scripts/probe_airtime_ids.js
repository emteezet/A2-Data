
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY?.trim();

async function probeAirtimeIDs() {
    console.log("Probing Potential Airtime Service IDs...");

    // ABA was "Carpaddy" (Blocked). Let's try others.
    // Common patter could be 3 letters.
    // Let's try to find documentation or standard ID mapping if possible, 
    // but probing is faster if we have candidates.

    const candidates = [
        "ABA", "ABB", "ABC", "ABD", // Old mapping
        "MTN", "GLO", "AIRTEL", "9MOBILE", // Network names
        "ORA", "ORB", "ORC", "ORD", // Random guess
        "WAEC", // Bill
    ];

    for (const id of candidates) {
        const url = `https://enterprise.mobilenig.com/api/v2/control/services_status?service_id=${id}&requestType=PREMIUM`;
        try {
            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${publicKey}` },
                timeout: 5000
            });
            console.log(`ID ${id}: ${response.data.details?.name || 'Unknown'} - ${response.data.details?.status}`);
        } catch (error) {
            // Ignore 404s/errors
        }
    }
}

probeAirtimeIDs();
