import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicKey = process.env.MOBILENIG_PUBLIC_KEY;
const secretKey = process.env.MOBILENIG_SECRET_KEY;

async function testMoreEndpoints() {
    console.log("=== Testing More Endpoint Paths ===\n");

    const paths = [
        // Purchase endpoints
        { method: "POST", path: "/services/purchase" },
        { method: "POST", path: "/services/airtime" },
        { method: "POST", path: "/services/data" },
        { method: "POST", path: "/services/vtu" },
        { method: "POST", path: "/purchase" },
        { method: "POST", path: "/transactions" },
        { method: "POST", path: "/transactions/purchase" },
        { method: "POST", path: "/transactions/airtime" },
        // Different base paths
        { method: "POST", path: "/v1/services", base: "https://enterprise.mobilenig.com/api" },
        { method: "GET", path: "/services/price_list?service_id=ABA", note: "price list" },
        { method: "GET", path: "/control/services_prices?service_id=ABA", note: "prices" },
        // Try secret key for services
        { method: "POST", path: "/services", useSecret: true, note: "with secret key" },
    ];

    const payload = {
        service_id: "ABA",
        requestType: "PREMIUM",
        phoneNumber: "08012345678",
        amount: 100,
        trans_id: "TEST-" + Date.now(),
    };

    for (const p of paths) {
        const base = p.base || "https://enterprise.mobilenig.com/api/v2";
        const key = p.useSecret ? secretKey : publicKey;
        const url = `${base}${p.path}`;

        try {
            let res;
            const headers = {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
            };

            if (p.method === "GET") {
                res = await axios.get(url, { headers, timeout: 10000 });
            } else {
                res = await axios.post(url, payload, { headers, timeout: 10000 });
            }
            console.log(`✅ ${p.method} ${p.path} ${p.note || ""}`);
            console.log(`   ${res.status}: ${JSON.stringify(res.data).substring(0, 300)}\n`);
        } catch (error) {
            const status = error.response?.status;
            const data = error.response?.data;
            const str = typeof data === "string"
                ? data.substring(0, 80).replace(/\n/g, " ")
                : JSON.stringify(data || "").substring(0, 150);
            console.log(`❌ ${p.method} ${p.path} ${p.note || ""} → ${status}: ${str}`);
        }
    }

    // Also try to get data plan prices (to confirm auth works for other GET endpoints)
    console.log("\n=== Testing GET endpoints that should work ===");
    const getEndpoints = [
        "/control/services_status?service_id=ABA",
        "/control/services_prices?service_id=ABA",
        "/services?service_id=ABA&requestType=PREMIUM",
    ];

    for (const path of getEndpoints) {
        try {
            const res = await axios.get(`https://enterprise.mobilenig.com/api/v2${path}`, {
                headers: { "Authorization": `Bearer ${publicKey}`, "Content-Type": "application/json" },
                timeout: 10000,
            });
            console.log(`✅ GET ${path}`);
            console.log(`   ${JSON.stringify(res.data).substring(0, 400)}\n`);
        } catch (error) {
            const data = error.response?.data;
            const str = typeof data === "string" ? data.substring(0, 80) : JSON.stringify(data || "").substring(0, 200);
            console.log(`❌ GET ${path} → ${error.response?.status}: ${str}`);
        }
    }
}

testMoreEndpoints();
